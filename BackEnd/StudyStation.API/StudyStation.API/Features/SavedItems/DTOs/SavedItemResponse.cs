using StudyStation.API.Features.SavedItems.Models;

namespace StudyStation.API.Features.SavedItems.DTOs
{
    public class SavedItemResponse
    {
        public int Id { get; set; }
        public int OriginalItemId { get; set; } // PostId or LibraryResourceId
        public string ItemType { get; set; } = string.Empty; // "Post" or "LibraryResource"
        public string Title { get; set; } = string.Empty;
        public string ContentSnippet { get; set; } = string.Empty;
        public string ResourceTypeName { get; set; } = string.Empty; // From LibraryResource, e.g., PDF, COURSE, ARTICLE
        public string Url { get; set; } = string.Empty; // Used for LibraryResources, or maybe Post URLs if any
        public string AuthorName { get; set; } = string.Empty;
        public DateTime SavedAt { get; set; }
    }
}
