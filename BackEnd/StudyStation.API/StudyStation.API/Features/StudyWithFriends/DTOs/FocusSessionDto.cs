using StudyStation.API.Features.StudyWithFriends.Models;

namespace StudyStation.API.Features.StudyWithFriends.DTOs;

public class FocusSessionDto
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public DateTime StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public FocusSessionStatus Status { get; set; }
    public int StartedById { get; set; }
}
