namespace StudyStation.API.Features.StudyWithFriends.DTOs;

public class CreateRoomDto
{
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = true;
    public string? Description { get; set; }
    public int MaxParticipants { get; set; } = 10;

}