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

            // 2. Build history for Gemini
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
                if (file?.ExtractedText is not null)
                    userMessage = $"[Study Material: {file.OriginalFileName}]\n\n{file.ExtractedText}\n\n---\n\nQuestion: {cmd.Message}";
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

            // 5. Call Gemini
            var aiResponse = await _ai.ChatAsync(userMessage, history, systemContext, ct);

            // 6. Persist both messages
            var userMsg = new AiMessage { ConversationId = conversation.Id, Role = "user", Content = cmd.Message, SentAt = DateTime.UtcNow };
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
