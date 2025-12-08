namespace StudyStation.API.Features.Library.Models
{
    public class LibraryResource
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Type { get; set; }
        public string Url { get; set; }
        public string FilePath { get; set; }
        public string Description { get; set; }

        public bool IsApproved { get; set; } = false;
        // 🔹 العلاقة مع Category
        public int CategoryId { get; set; }  // المفتاح الخارجي
        public LibraryCategory Category { get; set; }

        // 🔹 العلاقة مع ResourceType
        public int ResourceTypeId { get; set; }  // المفتاح الخارجي
        public ResourceType ResourceType { get; set; }
    }
}
