using StudyStation.API.Models;

namespace StudyStation.API.Features.AI.Models
{
    public class AiUploadedFile
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string OriginalFileName { get; set; } = string.Empty;

        /// <summary>GUID-based file name stored on disk.</summary>
        public string StoredFileName { get; set; } = string.Empty;

        public string FilePath { get; set; } = string.Empty;

        /// <summary>"PDF" | "Text" | "Other"</summary>
        public string FileType { get; set; } = "PDF";

        /// <summary>Full text extracted from the file (for AI context injection).</summary>
        public string? ExtractedText { get; set; }

        public long FileSizeBytes { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public bool IsProcessed { get; set; }

        // Navigation
        public ApplicationUser User { get; set; } = null!;
    }
}
