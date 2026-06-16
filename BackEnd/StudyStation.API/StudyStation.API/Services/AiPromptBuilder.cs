using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;

namespace StudyStation.API.Services
{
    /// <summary>
    /// Centralised prompt-engineering helper.
    /// Every method returns a complete, ready-to-send prompt string.
    /// Keeping prompts here makes it easy to iterate on quality
    /// without touching business logic in handlers.
    /// </summary>
    public class AiPromptBuilder
    {
        // ─── Chat ─────────────────────────────────────────────────────────────

        public string BuildSystemContext(string context, string? subject)
        {
            var subjectLine = subject is not null ? $" The subject being studied is: {subject}." : "";
            return context switch
            {
                "SoloRoom" => $"You are an expert academic tutor assisting a student during a solo study session.{subjectLine} Provide clear, accurate, and educational answers. When appropriate, give examples, analogies, and step-by-step explanations.",
                "GroupRoom" => $"You are an academic facilitator for a group study session.{subjectLine} Help resolve disagreements with evidence-based answers, encourage discussion, and provide clear explanations that benefit all participants.",
                _ => $"You are StudyStation AI, a comprehensive educational assistant.{subjectLine} Help students understand concepts, generate study materials, and improve their academic performance. Be clear, accurate, encouraging, and educational."
            };
        }

        // ─── Quiz ──────────────────────────────────────────────────────────────

        public string BuildQuizPrompt(string topic, int count, string difficulty, string questionType, string? material)
        {
            var materialSection = material is not null
                ? $"\n\nBase your questions on this study material:\n\"\"\"\n{TruncateText(material, 8000)}\n\"\"\""
                : string.Empty;

            var typeInstruction = questionType switch
            {
                "TrueFalse" => "Generate True/False questions only.",
                "FillBlank" => "Generate fill-in-the-blank questions only. Use ___ to indicate the blank.",
                "ShortAnswer" => "Generate short answer questions that require 1-3 sentence responses.",
                "Mixed" => "Mix question types: include MCQ, True/False, and Short Answer questions.",
                _ => "Generate Multiple Choice Questions (MCQ) with exactly 4 options (A, B, C, D)."
            };

            var jsonExample = questionType == "MCQ"
                ? """{"questionText":"...","questionType":"MCQ","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":"...","explanation":"...","difficultyLevel":"Medium"}"""
                : """{"questionText":"...","questionType":"TrueFalse","options":["True","False"],"correctAnswer":"True","explanation":"...","difficultyLevel":"Easy"}""";

            return $"Generate exactly {count} {difficulty.ToLower()}-difficulty questions about: \"{topic}\".\n" +
                   $"{typeInstruction}{materialSection}\n\n" +
                   "Return a JSON array with this exact structure (no markdown, no extra text, just the JSON array):\n" +
                   $"[{jsonExample}]\n\n" +
                   "Rules:\n" +
                   "- For TrueFalse: options should be [\"True\",\"False\"], correctAnswer is \"True\" or \"False\"\n" +
                   "- For FillBlank and ShortAnswer: options should be null\n" +
                   "- For MCQ: options must have exactly 4 items starting with A), B), C), D)\n" +
                   "- Every question MUST have a non-empty explanation\n" +
                   "- Return ONLY the JSON array, nothing else";
        }

        // ─── Flashcards ────────────────────────────────────────────────────────

        public string BuildFlashcardsPrompt(string topic, int count, string? material)
        {
            var materialSection = material is not null
                ? $"\n\nBase the flashcards on this study material:\n\"\"\"\n{TruncateText(material, 8000)}\n\"\"\""
                : string.Empty;

            var jsonExample = """{"front":"Term or concept","back":"Clear, concise definition or explanation","topic":"example"}""";

            return $"Generate exactly {count} flashcards for the topic: \"{topic}\".\n" +
                   $"{materialSection}\n\n" +
                   "Return a JSON array with this exact structure (no markdown, no extra text, just the JSON array):\n" +
                   $"[{jsonExample}]\n\n" +
                   "Rules:\n" +
                   "- Front should be a key term, concept, or question\n" +
                   "- Back should be a clear, memorable explanation (2-4 sentences max)\n" +
                   $"- Cover a diverse range of sub-topics within \"{topic}\"\n" +
                   "- Return ONLY the JSON array, nothing else";
        }

        // ─── Summary ───────────────────────────────────────────────────────────

        public string BuildSummaryPrompt(string topic, string content)
        {
            return $"Summarise the following study content about \"{topic}\" in a clear, well-structured way.\n\n" +
                   $"Content:\n\"\"\"\n{TruncateText(content, 10000)}\n\"\"\"\n\n" +
                   "Provide:\n" +
                   "1. A 3-5 paragraph summary\n" +
                   "2. A bullet list of the 5-10 most important points\n" +
                   "3. Key terms and definitions\n\n" +
                   "Format your response clearly with headers.";
        }

        // ─── Session Analysis ─────────────────────────────────────────────────

        public string BuildSessionAnalysisPrompt(string studyContent, string subject)
        {
            var jsonStructure = "{\n" +
                "  \"summary\": \"3-5 paragraph comprehensive summary\",\n" +
                "  \"mainPoints\": [\"point 1\", \"point 2\", \"point 3\"],\n" +
                "  \"keyConcepts\": [{\"concept\": \"term\", \"explanation\": \"explanation\"}],\n" +
                "  \"importantDefinitions\": [{\"term\": \"term\", \"definition\": \"definition\"}],\n" +
                "  \"studyRecommendations\": [\"recommendation 1\", \"recommendation 2\"],\n" +
                "  \"topicsRequiringMoreReview\": [\"topic 1\", \"topic 2\"],\n" +
                "  \"flashcards\": [{\"front\": \"term\", \"back\": \"definition\", \"topic\": \"" + subject + "\"}],\n" +
                "  \"quizQuestions\": [{\"questionText\": \"...\", \"questionType\": \"MCQ\", \"options\": [\"A) ...\", \"B) ...\", \"C) ...\", \"D) ...\"], \"correctAnswer\": \"...\", \"explanation\": \"...\", \"difficultyLevel\": \"Medium\"}]\n" +
                "}";

            return $"Perform a comprehensive analysis of this study session content about \"{subject}\".\n\n" +
                   $"Study Material:\n\"\"\"\n{TruncateText(studyContent, 10000)}\n\"\"\"\n\n" +
                   "Return a JSON object with this exact structure (no markdown, just JSON):\n" +
                   $"{jsonStructure}\n\n" +
                   "Rules:\n" +
                   "- mainPoints: 5-10 bullet points\n" +
                   "- keyConcepts: 5-8 key concepts\n" +
                   "- importantDefinitions: 3-6 definitions\n" +
                   "- studyRecommendations: 3-5 actionable recommendations\n" +
                   "- topicsRequiringMoreReview: topics that seem complex or underexplored\n" +
                   "- flashcards: exactly 8 flashcards\n" +
                   "- quizQuestions: exactly 5 MCQ questions\n" +
                   "- Return ONLY the JSON object, nothing else";
        }

        // ─── Group Session Analysis ────────────────────────────────────────────

        public string BuildGroupSessionAnalysisPrompt(string chatLog, string subject)
        {
            var jsonStructure = "{\n" +
                "  \"groupSummary\": \"Comprehensive summary of what was discussed\",\n" +
                "  \"meetingNotes\": \"Detailed meeting notes in paragraph form\",\n" +
                "  \"keyTakeaways\": [\"takeaway 1\", \"takeaway 2\"],\n" +
                "  \"mainDiscussionPoints\": [\"point 1\", \"point 2\"],\n" +
                "  \"suggestedFollowUpTopics\": [\"topic 1\", \"topic 2\"],\n" +
                "  \"flashcards\": [{\"front\": \"term\", \"back\": \"definition\", \"topic\": \"" + subject + "\"}],\n" +
                "  \"teamQuiz\": [{\"questionText\": \"...\", \"questionType\": \"MCQ\", \"options\": [\"A) ...\", \"B) ...\", \"C) ...\", \"D) ...\"], \"correctAnswer\": \"...\", \"explanation\": \"...\", \"difficultyLevel\": \"Medium\"}]\n" +
                "}";

            return $"Analyse this group study session chat log about \"{subject}\" and generate comprehensive meeting notes.\n\n" +
                   $"Chat Log:\n\"\"\"\n{TruncateText(chatLog, 10000)}\n\"\"\"\n\n" +
                   "Return a JSON object with this exact structure (no markdown, just JSON):\n" +
                   $"{jsonStructure}\n\n" +
                   "Return ONLY the JSON object, nothing else.";
        }

        // ─── Concept Explanation ──────────────────────────────────────────────

        public string BuildExplainPrompt(string concept, string level, string? material = null)
        {
            var instruction = level switch
            {
                "eli5" => "Explain this as if talking to a 5-year-old. Use very simple words, everyday analogies, and a fun tone.",
                "detailed" => "Provide a comprehensive, technically detailed explanation suitable for an advanced student. Include mechanisms, edge cases, and real-world applications.",
                _ => "Explain this clearly and simply. Use an analogy, a real-world example, and keep it accessible for a university student."
            };

            if (!string.IsNullOrWhiteSpace(material))
            {
                // Material-based explanation: explain the supplied content, using concept as a title
                return $"{instruction}\n\n" +
                       $"The topic is: \"{concept}\"\n\n" +
                       $"Study Material:\n\"\"\"\n{TruncateText(material, 8000)}\n\"\"\"\n\n" +
                       "Explain the content above clearly and in detail. " +
                       "Cover the main concepts, use examples or analogies where helpful, " +
                       "and structure your explanation with clear headings.";
            }

            // Concept-only explanation (no material provided)
            return $"{instruction}\n\nConcept: {concept}";
        }

        // ─── Key Concepts Extraction ──────────────────────────────────────────

        public string BuildKeyConceptsPrompt(string content)
        {
            return $"Extract the 8-12 most important key concepts from the following content.\n" +
                   "Format as a numbered list with the concept name bolded, followed by a brief explanation.\n\n" +
                   $"Content:\n\"\"\"\n{TruncateText(content, 8000)}\n\"\"\"";
        }

        // ─── Recommendations ──────────────────────────────────────────────────

        public string BuildRecommendationsPrompt(
            List<string> weakTopics,
            List<string> strongTopics,
            List<string> studiedSubjects,
            DateTime? lastStudiedAt)
        {
            var daysSince = lastStudiedAt.HasValue
                ? (int)(DateTime.UtcNow - lastStudiedAt.Value).TotalDays
                : -1;

            var lastStudiedLine = daysSince >= 0
                ? $"Last studied {daysSince} day(s) ago."
                : "No recorded study sessions yet.";

            return "Based on this student's learning profile, generate personalised study recommendations.\n\n" +
                   "Profile:\n" +
                   $"- Studied subjects: {string.Join(", ", studiedSubjects.DefaultIfEmpty("None yet"))}\n" +
                   $"- Strong topics: {string.Join(", ", strongTopics.DefaultIfEmpty("None identified yet"))}\n" +
                   $"- Weak topics: {string.Join(", ", weakTopics.DefaultIfEmpty("None identified yet"))}\n" +
                   $"- {lastStudiedLine}\n\n" +
                   "Provide:\n" +
                   "1. 3-5 specific, actionable study recommendations\n" +
                   "2. Suggested revision schedule for weak topics\n" +
                   "3. A motivational message\n\n" +
                   "If there are weak topics, prioritize revision of those topics.\n" +
                   "If the student hasn't studied recently, suggest getting back on track.\n" +
                   "Be encouraging and specific.";
        }

        // ─── Material Q&A ────────────────────────────────────────────────────

        public string BuildMaterialQaPrompt(string question, string material)
        {
            return "Answer the following question based ONLY on the provided study material.\n" +
                   "If the answer cannot be found in the material, say so clearly and provide a general answer from your knowledge.\n\n" +
                   $"Study Material:\n\"\"\"\n{TruncateText(material, 8000)}\n\"\"\"\n\n" +
                   $"Question: {question}\n\n" +
                   "Provide a clear, accurate, and educational answer.";
        }

        // ─── Helpers ──────────────────────────────────────────────────────────

        private static string TruncateText(string text, int maxChars)
            => text.Length <= maxChars
                ? text
                : text[..maxChars] + "\n\n[Content truncated for length...]";
    }
}
