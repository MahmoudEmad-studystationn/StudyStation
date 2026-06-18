using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Services;

namespace StudyStation.API.Features.AI.Commands
{
    // ─── Command ──────────────────────────────────────────────────────────────

    public record SendAiMessageCommand(
        int UserId,
        string Message,
        int? ConversationId,
        string Context,
        int? ContextEntityId,
        int? UploadedFileId
    ) : IRequest<AiChatResponseDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class SendAiMessageHandler : IRequestHandler<SendAiMessageCommand, AiChatResponseDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;
        private readonly AiPromptBuilder _prompts;

        public SendAiMessageHandler(DatabaseContext db, IAiService ai, AiPromptBuilder prompts)
        {
            _db = db;
            _ai = ai;
            _prompts = prompts;
        }

        public async Task<AiChatResponseDto> Handle(SendAiMessageCommand cmd, CancellationToken ct)
        {
            // 1. Resolve or create conversation
            AiConversation conversation;
            if (cmd.ConversationId.HasValue)
            {
                conversation = await _db.AiConversations
                    .Include(c => c.Messages)
                    .FirstOrDefaultAsync(c => c.Id == cmd.ConversationId && c.UserId == cmd.UserId, ct)
                    ?? throw new KeyNotFoundException("Conversation not found.");
            }
            else
            {
                conversation = new AiConversation
                {
                    UserId = cmd.UserId,
                    Context = cmd.Context,
                    ContextEntityId = cmd.ContextEntityId,
                    Title = cmd.Message.Length <= 60 ? cmd.Message : cmd.Message[..57] + "...",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.AiConversations.Add(conversation);
                await _db.SaveChangesAsync(ct);
            }

            // 2. Build history for the AI model
            var history = conversation.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new AiMessageDto { Id = m.Id, Role = m.Role, Content = m.Content, SentAt = m.SentAt })
                .ToList();

            // 3. Optionally inject uploaded file content as context
            var userMessage = cmd.Message;
            if (cmd.UploadedFileId.HasValue)
            {
                var file = await _db.AiUploadedFiles
                    .FirstOrDefaultAsync(f => f.Id == cmd.UploadedFileId && f.UserId == cmd.UserId, ct);

                if (file is not null && !string.IsNullOrWhiteSpace(file.ExtractedText))
                {
                    // Truncate so large PDFs / long text don't exceed the AI gateway's
                    // input limit or trigger a timeout (the AI call would otherwise fail,
                    // making it look like the assistant "can't read" the file).
                    const int maxChars = 4000;
                    var material = file.ExtractedText.Length <= maxChars
                        ? file.ExtractedText
                        : file.ExtractedText[..maxChars] + "\n\n[Content truncated for length...]";

                    // Allow file-only messages (no typed question).
                    var question = string.IsNullOrWhiteSpace(cmd.Message)
                        ? "Please read the study material above and summarise its key points."
                        : cmd.Message;

                    userMessage = $"[Study Material: {file.OriginalFileName}]\n\n{material}\n\n---\n\nQuestion: {question}";
                }
                else if (file is not null)
                {
                    // File exists but no text could be extracted (e.g. scanned/image-only
                    // PDF, or OCR failure). Tell the model so it can inform the user
                    // instead of silently ignoring the attachment.
                    userMessage =
                        $"[Note: The user attached a file \"{file.OriginalFileName}\" but no readable text " +
                        "could be extracted from it. Politely tell the user the file could not be read and " +
                        "ask them to paste the text or upload a clearer file.]\n\n" +
                        $"User message: {(string.IsNullOrWhiteSpace(cmd.Message) ? "(none)" : cmd.Message)}";
                }
                // If file is null (not found / not owned by user) fall back to the plain message.
            }

            // 4. Build system context
            string? subject = null;
            if (cmd.Context == "SoloRoom" && cmd.ContextEntityId.HasValue)
            {
                var session = await _db.StudySessions.FindAsync(new object[] { cmd.ContextEntityId.Value }, ct);
                subject = session?.SubjectName;
            }
            else if (cmd.Context == "GroupRoom" && cmd.ContextEntityId.HasValue)
            {
                var room = await _db.StudyRooms.FindAsync(new object[] { cmd.ContextEntityId.Value }, ct);
                subject = room?.Subject;
            }

            var systemContext = _prompts.BuildSystemContext(cmd.Context, subject);

            // 5. Call the AI service
            var aiResponse = await _ai.ChatAsync(userMessage, history, systemContext, ct);

            // 6. Persist both messages (keep a readable record even for file-only messages)
            var storedUserContent = !string.IsNullOrWhiteSpace(cmd.Message)
                ? cmd.Message
                : (cmd.UploadedFileId.HasValue ? "[Uploaded a file]" : cmd.Message);
            var userMsg = new AiMessage { ConversationId = conversation.Id, Role = "user", Content = storedUserContent, SentAt = DateTime.UtcNow };
            var modelMsg = new AiMessage { ConversationId = conversation.Id, Role = "model", Content = aiResponse, SentAt = DateTime.UtcNow };

            _db.AiMessages.Add(userMsg);
            _db.AiMessages.Add(modelMsg);

            conversation.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return new AiChatResponseDto
            {
                ConversationId = conversation.Id,
                Message = aiResponse,
                Role = "model",
                SentAt = modelMsg.SentAt
            };
        }
    }
}
