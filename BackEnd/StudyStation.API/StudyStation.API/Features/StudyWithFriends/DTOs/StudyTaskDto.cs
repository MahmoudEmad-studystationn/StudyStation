namespace StudyStation.API.Features.StudyWithFriends.DTOs;

public class StudyTaskDto
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
}
