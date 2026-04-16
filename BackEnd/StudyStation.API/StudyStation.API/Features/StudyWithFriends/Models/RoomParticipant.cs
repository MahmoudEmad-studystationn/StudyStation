using StudyStation.API.Models;

namespace StudyStation.API.Features.StudyWithFriends.Models;

public class RoomParticipant
{
    public int RoomId { get; set; }
    public StudyRoom Room { get; set; } = null!;

    public int UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public RoomRole Role { get; set; } = RoomRole.Member;
    
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
