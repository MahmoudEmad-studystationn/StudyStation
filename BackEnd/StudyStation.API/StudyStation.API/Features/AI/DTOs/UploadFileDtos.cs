namespace StudyStation.API.Features.AI.DTOs
{
    public class UploadFileResponseDto
    {
        public int Id { get; set; }
        public string OriginalFileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public bool IsProcessed { get; set; }
        public bool HasExtractedText { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
