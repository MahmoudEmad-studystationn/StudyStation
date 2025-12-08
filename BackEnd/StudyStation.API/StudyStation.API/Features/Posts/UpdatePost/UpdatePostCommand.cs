using MediatR;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StudyStation.API.Features.Posts.UpdatePost
{
    public class UpdatePostCommand : IRequest<UpdatePostResponse>
    {
        // هذا الحقل سيأتي من الرابط (route) وليس من الـ body
        [JsonIgnore]
        public int PostId { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 5)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(5000)]
        public string Content { get; set; } = string.Empty;
    }
}
