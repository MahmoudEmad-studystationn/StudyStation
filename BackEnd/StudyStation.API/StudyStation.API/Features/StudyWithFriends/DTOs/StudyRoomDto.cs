using StudyStation.API.Features.StudyWithFriends.Models;

namespace StudyStation.API.Features.StudyWithFriends.DTOs;

public class StudyRoomDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public string? RoomCode { get; set; }
    public DateTime CreatedAt { get; set; }
    public int OwnerId { get; set; }
    public int ParticipantsCount { get; set; }
}
