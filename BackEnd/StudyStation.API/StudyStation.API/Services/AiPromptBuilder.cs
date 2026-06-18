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
                ? $"\n\nBase your questions on this study material:\n\"\"\"\n{TruncateText(material, 4000)}\n\"\"\""
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

        public string BuildFlashcardPrompt(string topic, int count, string? material)
        {
            var materialSection = material is not null
                ? $"\n\nBase the flashcards on this study material:\n\"\"\"\n{TruncateText(material, 4000)}\n\"\"\""
                : string.Empty;

            return $"Generate exactly {count} study flashcards about: \"{topic}\".{materialSection}\n\n" +
                   "Each flashcard has a short \"front\" (a term, concept, or question) and a concise \"back\" (the definition or answer).\n\n" +
                   "Return a JSON array with this exact structure (no markdown, no extra text, just the JSON array):\n" +
                   "[{\"front\":\"...\",\"back\":\"...\",\"topic\":\"" + topic + "\"}]\n\n" +
                   "Rules:\n" +
                   "- front: keep it short (a term, concept, or question)\n" +
                   "- back: a clear, concise explanation or answer\n" +
                   "- Every flashcard MUST have a non-empty front and back\n" +
                   "- Return ONLY the JSON array, nothing else";
        }

        // ─── Summary ───────────────────────────────────────────────────────────

        public string BuildSummarizePrompt(string content)
        {
            return "Summarize the following content for a student who wants to revise it quickly.\n\n" +
                   $"Content:\n\"\"\"\n{TruncateText(content, 4000)}\n\"\"\"\n\n" +
                   "Provide:\n" +
                   "- A concise summary (1-3 short paragraphs)\n" +
                   "- A bulleted list of the key points\n" +
                   "Keep it accurate and focused on the most important information.";
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
                   $"Study Material:\n\"\"\"\n{TruncateText(studyContent, 4000)}\n\"\"\"\n\n" +
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
                   $"Chat Log:\n\"\"\"\n{TruncateText(chatLog, 4000)}\n\"\"\"\n\n" +
                   "Return a JSON object with this exact structure (no markdown, just JSON):\n" +
                   $"{jsonStructure}\n\n" +
                   "Return ONLY the JSON object, nothing else.";
        }

        // ─── Concept Explanation ──────────────────────────────────────────────

        public string BuildExplainPrompt(string concept, string? material)
        {
            var instruction = "Explain this clearly and simply. Use an analogy, a real-world example, and keep it accessible for a university student.";

            if (!string.IsNullOrWhiteSpace(material))
            {
                return $"{instruction}\n\n" +
                       $"Topic: {concept}\n\n" +
                       $"Study Material:\n\"\"\"\n{TruncateText(material, 4000)}\n\"\"\"\n\n" +
                       "Explain the content above clearly. " +
                       "Cover the main concepts, use examples or analogies where helpful, " +
                       "and structure your explanation with clear headings.";
            }

            return $"{instruction}\n\nConcept: {concept}";
        }

        // ─── Key Concepts Extraction ──────────────────────────────────────────

        public string BuildKeyConceptsPrompt(string content)
        {
            return $"Extract the 8-12 most important key concepts from the following content.\n" +
                   "Format as a numbered list with the concept name bolded, followed by a brief explanation.\n\n" +
                   $"Content:\n\"\"\"\n{TruncateText(content, 4000)}\n\"\"\"";
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
                   $"Study Material:\n\"\"\"\n{TruncateText(material, 4000)}\n\"\"\"\n\n" +
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
