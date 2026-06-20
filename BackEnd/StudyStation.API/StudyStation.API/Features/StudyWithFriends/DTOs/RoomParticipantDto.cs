using StudyStation.API.Features.StudyWithFriends.Models;

namespace StudyStation.API.Features.StudyWithFriends.DTOs;

public class RoomParticipantDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public RoomRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
    public bool IsOnline { get; set; }
    public DateTime? LastActiveAt { get; set; }
}
