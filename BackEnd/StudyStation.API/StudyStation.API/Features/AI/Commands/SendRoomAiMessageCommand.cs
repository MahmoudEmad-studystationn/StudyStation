using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Hubs;
using StudyStation.API.Services;

namespace StudyStation.API.Features.AI.Commands
{
    // ─── Command ──────────────────────────────────────────────────────────────

    public record SendRoomAiMessageCommand(
        int UserId,
        int RoomId,
        string Message,
        int? ConversationId,
        int? UploadedFileId
    ) : IRequest<RoomAiChatResponseDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class SendRoomAiMessageHandler : IRequestHandler<SendRoomAiMessageCommand, RoomAiChatResponseDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;
        private readonly AiPromptBuilder _prompts;
        private readonly IHubContext<StudyHub, IStudyClient> _hub;

        public SendRoomAiMessageHandler(
            DatabaseContext db,
            IAiService ai,
            AiPromptBuilder prompts,
            IHubContext<StudyHub, IStudyClient> hub)
        {
            _db = db;
            _ai = ai;
            _prompts = prompts;
            _hub = hub;
        }

        public async Task<RoomAiChatResponseDto> Handle(SendRoomAiMessageCommand cmd, CancellationToken ct)
        {
            // 1. Verify user is a member of the room
            var isMember = await _db.RoomParticipants
                .AnyAsync(rp => rp.RoomId == cmd.RoomId && rp.UserId == cmd.UserId, ct);

            if (!isMember)
                throw new UnauthorizedAccessException("You are not a member of this room.");

            // 2. Get sender name
            var user = await _db.Users.FindAsync(new object[] { cmd.UserId }, ct)
                ?? throw new KeyNotFoundException("User not found.");
            var senderName = $"{user.FirstName} {user.LastName}";

            // 3. Resolve or create shared room conversation
            AiConversation conversation;
            if (cmd.ConversationId.HasValue)
            {
                conversation = await _db.AiConversations
                    .Include(c => c.Messages)
                    .FirstOrDefaultAsync(c => c.Id == cmd.ConversationId && c.RoomId == cmd.RoomId, ct)
                    ?? throw new KeyNotFoundException("Conversation not found.");
            }
            else
            {
                conversation = new AiConversation
                {
                    UserId = null, // Shared conversation — no single owner
                    RoomId = cmd.RoomId,
                    Context = "GroupRoom",
                    ContextEntityId = cmd.RoomId,
                    Title = cmd.Message.Length <= 60 ? cmd.Message : cmd.Message[..57] + "...",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.AiConversations.Add(conversation);
                await _db.SaveChangesAsync(ct);
            }

            // 4. Build history for AI
            var history = conversation.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new AiMessageDto { Id = m.Id, Role = m.Role, Content = m.Content, SentAt = m.SentAt })
                .ToList();

            // 5. Optionally inject uploaded file content as context
            var userMessage = cmd.Message;
            if (cmd.UploadedFileId.HasValue)
            {
                var file = await _db.AiUploadedFiles
                    .FirstOrDefaultAsync(f => f.Id == cmd.UploadedFileId && f.UserId == cmd.UserId, ct);
                if (file?.ExtractedText is not null)
                    userMessage = $"[Study Material: {file.OriginalFileName}]\n\n{file.ExtractedText}\n\n---\n\nQuestion: {cmd.Message}";
            }

            // 6. Build system context
            var room = await _db.StudyRooms.FindAsync(new object[] { cmd.RoomId }, ct);
            var subject = room?.Subject;
            var systemContext = _prompts.BuildSystemContext("GroupRoom", subject);

            // 7. Broadcast user message to room via SignalR
            var userBroadcast = new RoomAiChatResponseDto
            {
                ConversationId = conversation.Id,
                Message = cmd.Message,
                Role = "user",
                SenderUserId = cmd.UserId,
                SenderName = senderName,
                SentAt = DateTime.UtcNow
            };
            await _hub.Clients.Group(cmd.RoomId.ToString())
                .AiMessageReceived(userBroadcast);

            // 8. Call AI
            var aiResponse = await _ai.ChatAsync(userMessage, history, systemContext, ct);

            // 9. Persist both messages
            var userMsg = new AiMessage
            {
                ConversationId = conversation.Id,
                Role = "user",
                Content = cmd.Message,
                SenderUserId = cmd.UserId,
                SenderName = senderName,
                SentAt = DateTime.UtcNow
            };
            var modelMsg = new AiMessage
            {
                ConversationId = conversation.Id,
                Role = "model",
                Content = aiResponse,
                SenderUserId = null,
                SenderName = "Study Station AI",
                SentAt = DateTime.UtcNow
            };

            _db.AiMessages.Add(userMsg);
            _db.AiMessages.Add(modelMsg);
            conversation.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            // 10. Broadcast AI response to room via SignalR
            var aiResponseDto = new RoomAiChatResponseDto
            {
                ConversationId = conversation.Id,
                Message = aiResponse,
                Role = "model",
                SenderUserId = null,
                SenderName = "Study Station AI",
                SentAt = modelMsg.SentAt
            };
            await _hub.Clients.Group(cmd.RoomId.ToString())
                .AiResponseReceived(aiResponseDto);

            return aiResponseDto;
        }
    }
}
