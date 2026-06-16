using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using UglyToad.PdfPig;

namespace StudyStation.API.Services
{
    /// <summary>
    /// ChatGPT-backed implementation of IAiService using the unofficial ChatGPT API
    /// at https://gpt-api.metaphilia.com.
    /// Configure via appsettings.json → "AI" section.
    /// </summary>
    public class ChatGptAiService : IAiService
    {
        private readonly AiPromptBuilder _promptBuilder;
        private readonly ILogger<ChatGptAiService> _logger;
        private readonly HttpClient _httpClient;
        private readonly int _timeout;

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

        public ChatGptAiService(
            HttpClient httpClient,
            IConfiguration config,
            AiPromptBuilder promptBuilder,
            ILogger<ChatGptAiService> logger)
        {
            _promptBuilder = promptBuilder;
            _logger = logger;
            _httpClient = httpClient;

            var baseUrl = config["AI:ChatGptBaseUrl"]
                ?? throw new InvalidOperationException("ChatGPT base URL not configured. Set AI:ChatGptBaseUrl in appsettings.json.");
            var apiKey = config["AI:ChatGptApiKey"]
                ?? throw new InvalidOperationException("ChatGPT API key not configured. Set AI:ChatGptApiKey in appsettings.json.");

            _httpClient.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            _httpClient.Timeout = TimeSpan.FromSeconds(300); // HTTP-level timeout slightly above API timeout

            _timeout = int.TryParse(config["AI:Timeout"], out var t) ? t : 240;
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
                // Build full message with context + history embedded
                var sb = new StringBuilder();

                if (!string.IsNullOrEmpty(systemContext))
                {
                    sb.AppendLine("[System Instructions]");
                    sb.AppendLine(systemContext);
                    sb.AppendLine();
                }

                if (history.Count > 0)
                {
                    sb.AppendLine("[Conversation History]");
                    foreach (var msg in history)
                    {
                        var role = msg.Role == "user" ? "User" : "Assistant";
                        sb.AppendLine($"[{role}]: {msg.Content}");
                    }
                    sb.AppendLine();
                }

                sb.AppendLine("[Current User Message]");
                sb.AppendLine(userMessage);

                return await SendChatRequestAsync(sb.ToString(), ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during ChatGPT chat call");
                throw new InvalidOperationException("AI service is currently unavailable. Please try again later.", ex);
            }
        }

        // ─── Summary ───────────────────────────────────────────────────────────

        public async Task<string> SummarizeAsync(string content, string topic, CancellationToken ct = default)
        {
            var prompt = _promptBuilder.BuildSummaryPrompt(topic, content);
            return await GenerateSimpleResponseAsync(prompt, ct);
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
            var prompt = _promptBuilder.BuildFlashcardsPrompt(topic, count, sourceMaterial);
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

        // ─── Group Session Analysis ───────────────────────────────────────────

        public async Task<GroupSessionAnalyticsDto> AnalyzeGroupSessionAsync(
            string chatLog, string subject, CancellationToken ct = default)
        {
            var prompt = _promptBuilder.BuildGroupSessionAnalysisPrompt(chatLog, subject);
            var json = await GenerateJsonResponseAsync(prompt, ct);

            try
            {
                var raw = JsonSerializer.Deserialize<GroupSessionRaw>(json, _jsonOptions)
                    ?? throw new InvalidOperationException("Null deserialization result");

                return new GroupSessionAnalyticsDto
                {
                    GroupSummary = raw.GroupSummary ?? string.Empty,
                    MeetingNotes = raw.MeetingNotes ?? string.Empty,
                    KeyTakeaways = raw.KeyTakeaways ?? new(),
                    MainDiscussionPoints = raw.MainDiscussionPoints ?? new(),
                    SuggestedFollowUpTopics = raw.SuggestedFollowUpTopics ?? new(),
                    Flashcards = raw.Flashcards?.Count > 0
                        ? new AiFlashcardSetDto
                        {
                            Topic = subject,
                            Title = $"Group Flashcards — {subject}",
                            Flashcards = raw.Flashcards.Select(f => new AiFlashcardDto
                            {
                                Front = f.Front ?? string.Empty,
                                Back = f.Back ?? string.Empty,
                                Topic = subject
                            }).ToList()
                        }
                        : null,
                    TeamQuiz = raw.TeamQuiz?.Count > 0
                        ? new AiQuizDto
                        {
                            Topic = subject,
                            Title = $"Team Quiz — {subject}",
                            Questions = raw.TeamQuiz.Select(q => new AiQuizQuestionDto
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
                _logger.LogError(ex, "Failed to parse group session JSON: {Json}", json);
                return new GroupSessionAnalyticsDto
                {
                    GroupSummary = "Analysis could not be parsed.",
                    GeneratedAt = DateTime.UtcNow
                };
            }
        }

        // ─── Explain ──────────────────────────────────────────────────────────

        public Task<string> ExplainConceptAsync(string concept, string level = "simple", string? sourceMaterial = null, CancellationToken ct = default)
            => GenerateSimpleResponseAsync(_promptBuilder.BuildExplainPrompt(concept, level, sourceMaterial), ct);

        // ─── Key Concepts ─────────────────────────────────────────────────────

        public Task<string> ExtractKeyConceptsAsync(string content, CancellationToken ct = default)
            => GenerateSimpleResponseAsync(_promptBuilder.BuildKeyConceptsPrompt(content), ct);

        // ─── Recommendations ──────────────────────────────────────────────────

        public Task<string> GenerateRecommendationsAsync(UserLearningMemory memory, CancellationToken ct = default)
        {
            var weak = DeserializeList(memory.WeakTopicsJson);
            var strong = DeserializeList(memory.StrongTopicsJson);
            var subjects = DeserializeList(memory.StudiedSubjectsJson);
            var prompt = _promptBuilder.BuildRecommendationsPrompt(weak, strong, subjects, memory.LastStudiedAt);
            return GenerateSimpleResponseAsync(prompt, ct);
        }

        // ─── Material Q&A ─────────────────────────────────────────────────────

        public Task<string> AnswerFromMaterialAsync(string question, string material, CancellationToken ct = default)
            => GenerateSimpleResponseAsync(_promptBuilder.BuildMaterialQaPrompt(question, material), ct);

        // ─── PDF Extraction ───────────────────────────────────────────────────

        public Task<string> ExtractTextFromPdfAsync(Stream pdfStream, CancellationToken ct = default)
        {
            try
            {
                // Ensure stream is at the beginning (defensive seek)
                if (pdfStream.CanSeek) pdfStream.Seek(0, SeekOrigin.Begin);

                using var document = PdfDocument.Open(pdfStream);
                var sb = new System.Text.StringBuilder();

                foreach (var page in document.GetPages())
                {
                    // GetWords() is more reliable than p.Text for most PDF layouts
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

        // ─── Private Helpers ──────────────────────────────────────────────────

        private async Task<string> SendChatRequestAsync(string message, CancellationToken ct)
        {
            var request = new ChatGptRequest
            {
                Message = message,
                Timeout = _timeout,
                InputMode = "INSTANT"
            };

            var jsonContent = JsonSerializer.Serialize(request, _requestJsonOptions);
            var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            _logger.LogDebug("Sending ChatGPT request ({Length} chars)", message.Length);

            var response = await _httpClient.PostAsync("chat", httpContent, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("ChatGPT API returned {StatusCode}: {Body}", response.StatusCode, errorBody);
                throw new InvalidOperationException($"ChatGPT API error ({response.StatusCode}): {errorBody}");
            }

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            var chatResponse = JsonSerializer.Deserialize<ChatGptResponse>(responseJson, _jsonOptions);

            return chatResponse?.Response ?? "I was unable to generate a response. Please try again.";
        }

        private Task<string> GenerateSimpleResponseAsync(string prompt, CancellationToken ct)
            => SendChatRequestAsync(prompt, ct);

        private async Task<string> GenerateJsonResponseAsync(string prompt, CancellationToken ct)
        {
            var text = await SendChatRequestAsync(prompt, ct);

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

        // ─── Request / Response DTOs ─────────────────────────────────────────

        private class ChatGptRequest
        {
            public string Message { get; set; } = string.Empty;
            public int? Timeout { get; set; }
            public string? InputMode { get; set; }
            public string? ConversationId { get; set; }
            public bool? TemporaryChat { get; set; }
        }

        private class ChatGptResponse
        {
            public string? Response { get; set; }
            public string? ConversationId { get; set; }
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

        private class GroupSessionRaw
        {
            public string? GroupSummary { get; set; }
            public string? MeetingNotes { get; set; }
            public List<string>? KeyTakeaways { get; set; }
            public List<string>? MainDiscussionPoints { get; set; }
            public List<string>? SuggestedFollowUpTopics { get; set; }
            public List<FlashcardRaw>? Flashcards { get; set; }
            public List<QuizQuestionRaw>? TeamQuiz { get; set; }
        }
    }
}
