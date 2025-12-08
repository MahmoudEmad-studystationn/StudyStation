using MediatR;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StudyStation.API.Features.Reactions.AddReaction
{
    public class AddReactionCommand : IRequest<AddReactionResponse>
    {
        // سيتم تجاهل هذه الحقول عند قراءة الـ Body
        // وسنحددها يدوياً من الرابط (route)
        [JsonIgnore]
        public int? PostId { get; set; }

        [JsonIgnore]
        public int? CommentId { get; set; }

        [Required]
        public string Type { get; set; } = string.Empty; // e.g., "Like", "Love", "Haha"
    }
}
