using MediatR;
using Microsoft.AspNetCore.SignalR;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record CreateRoomCommand(CreateRoomDto Dto, int UserId) : IRequest<StudyRoomDto>;

public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, StudyRoomDto>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public CreateRoomCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<StudyRoomDto> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        string? generatedCode = null;
        if (!request.Dto.IsPublic)
        {
            bool isUnique = false;
            while (!isUnique)
            {
                generatedCode = GenerateRoomCode();
                isUnique = !_context.StudyRooms.Any(r => r.RoomCode == generatedCode);
            }
        }

        var room = new StudyRoom
        {
            Name = request.Dto.Name,
            Subject = request.Dto.Subject,
            Description = request.Dto.Description,
            IsPublic = request.Dto.IsPublic,
            RoomCode = generatedCode,
            OwnerId = request.UserId,
            MaxParticipants = request.Dto.MaxParticipants,
            CreatedAt = DateTime.UtcNow
        };

        // Add the owner as a participant automatically
        var participant = new RoomParticipant
        {
            Room = room,
            UserId = request.UserId,
            Role = RoomRole.Owner,
            JoinedAt = DateTime.UtcNow
        };

        _context.StudyRooms.Add(room);
        _context.RoomParticipants.Add(participant);

        await _context.SaveChangesAsync(cancellationToken);

        await _hubContext.Clients.All.RoomCreated(new
        {
            room.Id,
            room.Name,
            room.Subject,
            room.MaxParticipants
        });

        return new StudyRoomDto
        {
            Id = room.Id,
            Name = room.Name,
            Subject = room.Subject,
            Description = room.Description,
            IsPublic = room.IsPublic,
            RoomCode = room.RoomCode,
            OwnerId = room.OwnerId,
            MaxParticipants = room.MaxParticipants,
            CreatedAt = room.CreatedAt,
            ParticipantsCount = 1
        };
    }

    private string GenerateRoomCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}