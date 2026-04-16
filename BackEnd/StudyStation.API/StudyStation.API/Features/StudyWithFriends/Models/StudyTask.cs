using System.ComponentModel.DataAnnotations;
using StudyStation.API.Models;

namespace StudyStation.API.Features.StudyWithFriends.Models;

public class StudyTask
{
    [Key]
    public int Id { get; set; }

    public int RoomId { get; set; }
    public StudyRoom Room { get; set; } = null!;

    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; } = false;

    public int CreatedById { get; set; }
    public ApplicationUser CreatedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
