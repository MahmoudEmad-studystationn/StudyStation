using System.ComponentModel.DataAnnotations;
using StudyStation.API.Models;

namespace StudyStation.API.Features.StudyWithFriends.Models;

public class RoomMessage
{
    [Key]
    public int Id { get; set; }

    public int RoomId { get; set; }
    public StudyRoom Room { get; set; } = null!;

    public int SenderId { get; set; }
    public ApplicationUser Sender { get; set; } = null!;

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
