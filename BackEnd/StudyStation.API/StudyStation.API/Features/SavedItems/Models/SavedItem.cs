using StudyStation.API.Features.Library.Models;
using StudyStation.API.Models;

namespace StudyStation.API.Features.SavedItems.Models
{
    public class SavedItem
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        public SavedItemType ItemType { get; set; }

        public int? PostId { get; set; }
        public Post? Post { get; set; }

        public int? LibraryResourceId { get; set; }
        public LibraryResource? LibraryResource { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }

    public enum SavedItemType
    {
        Post,
        LibraryResource
    }
}
