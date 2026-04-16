using System.ComponentModel.DataAnnotations;
using StudyStation.API.Models;

namespace StudyStation.API.Features.StudyWithFriends.Models;

public class FocusSession
{
    [Key]
    public int Id { get; set; }

    public int RoomId { get; set; }
    public StudyRoom Room { get; set; } = null!;

    public DateTime StartTime { get; set; } = DateTime.UtcNow;
    
    // Duration requested by user in minutes
    public int DurationMinutes { get; set; }

    public FocusSessionStatus Status { get; set; } = FocusSessionStatus.Active;

    public int StartedById { get; set; }
    public ApplicationUser StartedBy { get; set; } = null!;
}
