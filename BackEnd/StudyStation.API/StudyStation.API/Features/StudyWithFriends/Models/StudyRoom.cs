using System.ComponentModel.DataAnnotations;
using StudyStation.API.Models;

namespace StudyStation.API.Features.StudyWithFriends.Models;

public class StudyRoom
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Subject { get; set; } = string.Empty;

    public bool IsPublic { get; set; } = true;
    
    [MaxLength(50)]
    public string? RoomCode { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int OwnerId { get; set; }
    public ApplicationUser Owner { get; set; } = null!;

    public ICollection<RoomParticipant> Participants { get; set; } = new List<RoomParticipant>();
    public ICollection<StudyTask> Tasks { get; set; } = new List<StudyTask>();
    public ICollection<RoomMessage> Messages { get; set; } = new List<RoomMessage>();
    public ICollection<FocusSession> FocusSessions { get; set; } = new List<FocusSession>();
}
