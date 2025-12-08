using MediatR;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace StudyStation.API.Features.Comments.AddComment
{
    public class AddCommentCommand : IRequest<AddCommentResponse>
    {
        // هذا الحقل سيأتي من الرابط (route)
        [JsonIgnore]
        public int PostId { get; set; }

        [Required]
        [StringLength(2000)]
        public string Content { get; set; } = string.Empty;

        // ... (الخصائص الموجودة PostId, Content)

        // حقل اختياري لتحديد التعليق الذي نرد عليه
        public int? ParentCommentId { get; set; }

    }
}
