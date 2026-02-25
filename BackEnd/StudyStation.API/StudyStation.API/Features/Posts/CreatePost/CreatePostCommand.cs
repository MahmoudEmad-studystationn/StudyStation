using MediatR;
using System.ComponentModel.DataAnnotations;

namespace StudyStation.API.Features.Posts.CreatePost
{
    public class CreatePostCommand : IRequest<CreatePostResponse>
    {
        [Required]
        [StringLength(100, MinimumLength = 5)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(5000)]
        public string Content { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }
        public int? ParentPostId { get; set; }
    }
}
