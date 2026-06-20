using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Tesseract;
using UglyToad.PdfPig;

namespace StudyStation.API.Services
{
    /// <summary>
    /// Groq-backed implementation of IAiService using the OpenAI-compatible
    /// chat completions endpoint at https://api.groq.com/openai/v1/chat/completions.
    /// Configure via appsettings.json → "AI" section.
    /// </summary>
    public class GroqAiService : IAiService
    {
        private readonly AiPromptBuilder _promptBuilder;
        private readonly ILogger<GroqAiService> _logger;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly string _model;

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            AllowTrailingCommas = true
        };

        private static readonly JsonSerializerOptions _requestJsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public GroqAiService(
            HttpClient httpClient,
            IConfiguration config,
            AiPromptBuilder promptBuilder,
            ILogger<GroqAiService> logger)
        {
            _promptBuilder = promptBuilder;
            _logger = logger;
            _httpClient = httpClient;
            _config = config;

            var baseUrl = config["AI:GroqBaseUrl"]
                ?? "https://api.groq.com";
            var apiKey = config["AI:GroqApiKey"]
                ?? throw new InvalidOperationException("Groq API key not configured. Set AI:GroqApiKey in appsettings.json.");

            _model = config["AI:GroqModel"] ?? "llama-3.3-70b-versatile";

            _httpClient.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            _httpClient.Timeout = TimeSpan.FromSeconds(300);
        }

        // ─── Chat ──────────────────────────────────────────────────────────────

        public async Task<string> ChatAsync(
            string userMessage,
            List<AiMessageDto> history,
            string? systemContext = null,
            CancellationToken ct = default)
        {
            try
            {
                var messages = new List<GroqMessage>();

                // Add system message if provided
                if (!string.IsNullOrEmpty(systemContext))
                {
                    messages.Add(new GroqMessage { Role = "system", Content = systemContext });
                }

                // Add conversation history
                foreach (var msg in history)
                {
                    messages.Add(new GroqMessage
                    {
                        Role = msg.Role == "user" ? "user" : "assistant",
                        Content = msg.Content
                    });
                }

                // Add current user message
                messages.Add(new GroqMessage { Role = "user", Content = userMessage });

                return await SendChatRequestAsync(messages, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Groq chat call");
                throw new InvalidOperationException("AI service is currently unavailable. Please try again later.", ex);
            }
        }

        // ─── Quiz Generation ──────────────────────────────────────────────────

        public async Task<List<AiQuizQuestionDto>> GenerateQuizAsync(
            string topic, int count, string difficulty, string questionType,
            string? sourceMaterial = null, CancellationToken ct = default)
        {
            var prompt = _promptBuilder.BuildQuizPrompt(topic, count, difficulty, questionType, sourceMaterial);
            var json = await GenerateJsonResponseAsync(prompt, ct);

            try
            {
                var questions = JsonSerializer.Deserialize<List<QuizQuestionRaw>>(json, _jsonOptions) ?? new();
                return questions.Select(q => new AiQuizQuestionDto
                {
                    QuestionText = q.QuestionText ?? string.Empty,
                    QuestionType = q.QuestionType ?? questionType,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer ?? string.Empty,
                    Explanation = q.Explanation ?? string.Empty,
                    DifficultyLevel = q.DifficultyLevel ?? difficulty
                }).ToList();
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialise quiz JSON: {Json}", json);
                return new List<AiQuizQuestionDto>();
            }
        }

        // ─── Flashcard Generation ─────────────────────────────────────────────

        public async Task<List<AiFlashcardDto>> GenerateFlashcardsAsync(
            string topic, int count, string? sourceMaterial = null, CancellationToken ct = default)
        {
            var prompt = _promptBuilder.BuildFlashcardPrompt(topic, count, sourceMaterial);
            var json = await GenerateJsonResponseAsync(prompt, ct);

            try
            {
                var flashcards = JsonSerializer.Deserialize<List<FlashcardRaw>>(json, _jsonOptions) ?? new();
                return flashcards.Select(f => new AiFlashcardDto
                {
                    Front = f.Front ?? string.Empty,
                    Back = f.Back ?? string.Empty,
                    Topic = f.Topic ?? topic
                }).ToList();
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialise flashcard JSON: {Json}", json);
                return new List<AiFlashcardDto>();
            }
        }

        // ─── Session Analysis ─────────────────────────────────────────────────

        public async Task<SessionAnalyticsDto> AnalyzeSessionAsync(
            string studyContent, string subject, CancellationToken ct = default)
        {
            var prompt = _promptBuilder.BuildSessionAnalysisPrompt(studyContent, subject);
            var json = await GenerateJsonResponseAsync(prompt, ct);

            try
            {
                var raw = JsonSerializer.Deserialize<SessionAnalysisRaw>(json, _jsonOptions)
                    ?? throw new InvalidOperationException("Null deserialization result");

                return new SessionAnalyticsDto
                {
                    Subject = subject,
                    Summary = raw.Summary ?? string.Empty,
                    MainPoints = raw.MainPoints ?? new(),
                    KeyConcepts = raw.KeyConcepts?.Select(k => new KeyConceptDto
                    {
                        Concept = k.Concept ?? string.Empty,
                        Explanation = k.Explanation ?? string.Empty
                    }).ToList() ?? new(),
                    ImportantDefinitions = raw.ImportantDefinitions?.Select(d => new DefinitionDto
                    {
                        Term = d.Term ?? string.Empty,
                        Definition = d.Definition ?? string.Empty
                    }).ToList() ?? new(),
                    StudyRecommendations = raw.StudyRecommendations ?? new(),
                    TopicsRequiringMoreReview = raw.TopicsRequiringMoreReview ?? new(),
                    Flashcards = raw.Flashcards?.Count > 0
                        ? new AiFlashcardSetDto
                        {
                            Topic = subject,
                            Title = $"Flashcards — {subject}",
                            Flashcards = raw.Flashcards.Select(f => new AiFlashcardDto
                            {
                                Front = f.Front ?? string.Empty,
                                Back = f.Back ?? string.Empty,
                                Topic = f.Topic ?? subject
                            }).ToList()
                        }
                        : null,
                    Quiz = raw.QuizQuestions?.Count > 0
                        ? new AiQuizDto
                        {
                            Topic = subject,
                            Title = $"Session Quiz — {subject}",
                            Questions = raw.QuizQuestions.Select(q => new AiQuizQuestionDto
                            {
                                QuestionText = q.QuestionText ?? string.Empty,
                                QuestionType = q.QuestionType ?? "MCQ",
                                Options = q.Options,
                                CorrectAnswer = q.CorrectAnswer ?? string.Empty,
                                Explanation = q.Explanation ?? string.Empty,
                                DifficultyLevel = q.DifficultyLevel ?? "Medium"
                            }).ToList()
                        }
                        : null,
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse session analysis JSON: {Json}", json);
                return new SessionAnalyticsDto
                {
                    Subject = subject,
                    Summary = "Analysis could not be parsed. Raw content: " + json[..Math.Min(500, json.Length)],
                    GeneratedAt = DateTime.UtcNow
                };
            }
        }

        // ─── Explain ──────────────────────────────────────────────────────────

        public Task<string> ExplainConceptAsync(string concept, string? sourceMaterial = null, CancellationToken ct = default)
            => GenerateSimpleResponseAsync(_promptBuilder.BuildExplainPrompt(concept, sourceMaterial), ct);

        // ─── Summarize ────────────────────────────────────────────────────────

        public Task<string> SummarizeAsync(string content, CancellationToken ct = default)
            => GenerateSimpleResponseAsync(_promptBuilder.BuildSummarizePrompt(content), ct);

        // ─── Recommendations ──────────────────────────────────────────────────

        public Task<string> GenerateRecommendationsAsync(UserLearningMemory memory, CancellationToken ct = default)
        {
            var weak = DeserializeList(memory.WeakTopicsJson);
            var strong = DeserializeList(memory.StrongTopicsJson);
            var subjects = DeserializeList(memory.StudiedSubjectsJson);
            var prompt = _promptBuilder.BuildRecommendationsPrompt(weak, strong, subjects, memory.LastStudiedAt);
            return GenerateSimpleResponseAsync(prompt, ct);
        }

        // ─── PDF Extraction ───────────────────────────────────────────────────

        public Task<string> ExtractTextFromPdfAsync(Stream pdfStream, CancellationToken ct = default)
        {
            try
            {
                if (pdfStream.CanSeek) pdfStream.Seek(0, SeekOrigin.Begin);

                using var document = PdfDocument.Open(pdfStream);
                var sb = new StringBuilder();

                foreach (var page in document.GetPages())
                {
                    var words = page.GetWords();
                    var lineText = string.Join(" ", words.Select(w => w.Text));
                    if (!string.IsNullOrWhiteSpace(lineText))
                        sb.AppendLine(lineText);
                }

                var text = sb.ToString().Trim();

                if (string.IsNullOrWhiteSpace(text))
                    _logger.LogWarning("PDF text extraction returned empty — file may be a scanned/image-based PDF (no text layer).");
                else
                    _logger.LogInformation("PDF text extracted successfully: {CharCount} characters.", text.Length);

                return Task.FromResult(text);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to extract text from PDF: {Message}", ex.Message);
                return Task.FromResult(string.Empty);
            }
        }

        // ─── Image OCR Extraction ─────────────────────────────────────────────

        public Task<string> ExtractTextFromImageAsync(Stream imageStream, CancellationToken ct = default)
        {
            try
            {
                if (imageStream.CanSeek) imageStream.Seek(0, SeekOrigin.Begin);

                var tessdataPath = _config["AI:TessdataPath"] ?? "tessdata";

                var language = "eng";
                var araPath = Path.Combine(tessdataPath, "ara.traineddata");
                if (File.Exists(araPath))
                    language = "eng+ara";

                using var engine = new TesseractEngine(tessdataPath, language, EngineMode.Default);

                using var ms = new MemoryStream();
                imageStream.CopyTo(ms);
                var imageBytes = ms.ToArray();

                using var pix = Pix.LoadFromMemory(imageBytes);
                using var page = engine.Process(pix);

                var text = page.GetText()?.Trim() ?? string.Empty;
                var confidence = page.GetMeanConfidence();

                if (string.IsNullOrWhiteSpace(text))
                    _logger.LogWarning("OCR returned empty text — image may not contain readable text.");
                else
                    _logger.LogInformation("OCR extracted {CharCount} chars with {Confidence:P0} confidence.", text.Length, confidence);

                return Task.FromResult(text);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to extract text from image via OCR: {Message}", ex.Message);
                return Task.FromResult(string.Empty);
            }
        }

        // ─── Private Helpers ──────────────────────────────────────────────────

        private async Task<string> SendChatRequestAsync(List<GroqMessage> messages, CancellationToken ct)
        {
            var request = new GroqChatRequest
            {
                Model = _model,
                Messages = messages,
                Temperature = 0.7,
                MaxTokens = 4096
            };

            var jsonContent = JsonSerializer.Serialize(request, _requestJsonOptions);
            var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            _logger.LogDebug("Sending Groq request with {MessageCount} messages, model: {Model}",
                messages.Count, _model);

            var response = await _httpClient.PostAsync("openai/v1/chat/completions", httpContent, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Groq API returned {StatusCode}: {Body}", response.StatusCode, errorBody);
                throw new InvalidOperationException($"Groq API error ({response.StatusCode}): {errorBody}");
            }

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            var chatResponse = JsonSerializer.Deserialize<GroqChatResponse>(responseJson, _jsonOptions);

            var content = chatResponse?.Choices?.FirstOrDefault()?.Message?.Content;
            return content ?? "I was unable to generate a response. Please try again.";
        }

        private Task<string> GenerateSimpleResponseAsync(string prompt, CancellationToken ct)
        {
            var messages = new List<GroqMessage>
            {
                new() { Role = "system", Content = "You are StudyStation AI, a comprehensive educational assistant. Help students understand concepts, generate study materials, and improve their academic performance. Be clear, accurate, encouraging, and educational." },
                new() { Role = "user", Content = prompt }
            };
            return SendChatRequestAsync(messages, ct);
        }

        private async Task<string> GenerateJsonResponseAsync(string prompt, CancellationToken ct)
        {
            var messages = new List<GroqMessage>
            {
                new() { Role = "system", Content = "You are a precise JSON generator. Return ONLY valid JSON with no additional text, no markdown code fences, and no explanations." },
                new() { Role = "user", Content = prompt }
            };

            var text = await SendChatRequestAsync(messages, ct);

            // Strip markdown code fences if present
            text = text.Trim();
            if (text.StartsWith("```json")) text = text[7..];
            else if (text.StartsWith("```")) text = text[3..];
            if (text.EndsWith("```")) text = text[..^3];

            return text.Trim();
        }

        private static List<string> DeserializeList(string? json)
        {
            if (string.IsNullOrEmpty(json)) return new();
            try { return JsonSerializer.Deserialize<List<string>>(json) ?? new(); }
            catch { return new(); }
        }

        // ─── Request / Response DTOs (OpenAI-compatible) ─────────────────────

        private class GroqMessage
        {
            [JsonPropertyName("role")]
            public string Role { get; set; } = string.Empty;

            [JsonPropertyName("content")]
            public string Content { get; set; } = string.Empty;
        }

        private class GroqChatRequest
        {
            [JsonPropertyName("model")]
            public string Model { get; set; } = string.Empty;

            [JsonPropertyName("messages")]
            public List<GroqMessage> Messages { get; set; } = new();

            [JsonPropertyName("temperature")]
            public double? Temperature { get; set; }

            [JsonPropertyName("max_tokens")]
            public int? MaxTokens { get; set; }
        }

        private class GroqChatResponse
        {
            [JsonPropertyName("choices")]
            public List<GroqChoice>? Choices { get; set; }
        }

        private class GroqChoice
        {
            [JsonPropertyName("message")]
            public GroqMessage? Message { get; set; }
        }

        // ─── Private raw deserialization types ────────────────────────────────

        private class QuizQuestionRaw
        {
            public string? QuestionText { get; set; }
            public string? QuestionType { get; set; }
            public List<string>? Options { get; set; }
            public string? CorrectAnswer { get; set; }
            public string? Explanation { get; set; }
            public string? DifficultyLevel { get; set; }
        }

        private class FlashcardRaw
        {
            public string? Front { get; set; }
            public string? Back { get; set; }
            public string? Topic { get; set; }
        }

        private class KeyConceptRaw
        {
            public string? Concept { get; set; }
            public string? Explanation { get; set; }
        }

        private class DefinitionRaw
        {
            public string? Term { get; set; }
            public string? Definition { get; set; }
        }

        private class SessionAnalysisRaw
        {
            public string? Summary { get; set; }
            public List<string>? MainPoints { get; set; }
            public List<KeyConceptRaw>? KeyConcepts { get; set; }
            public List<DefinitionRaw>? ImportantDefinitions { get; set; }
            public List<string>? StudyRecommendations { get; set; }
            public List<string>? TopicsRequiringMoreReview { get; set; }
            public List<FlashcardRaw>? Flashcards { get; set; }
            public List<QuizQuestionRaw>? QuizQuestions { get; set; }
        }
    }
}
