using MediatR;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Services;

namespace StudyStation.API.Features.AI.Commands
{
    // ─── Command ──────────────────────────────────────────────────────────────

    public record UploadStudyMaterialCommand(
        int UserId,
        IFormFile File
    ) : IRequest<UploadFileResponseDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class UploadStudyMaterialHandler : IRequestHandler<UploadStudyMaterialCommand, UploadFileResponseDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;
        private readonly IConfiguration _config;
        private readonly ILogger<UploadStudyMaterialHandler> _logger;

        public UploadStudyMaterialHandler(
            DatabaseContext db, IAiService ai,
            IConfiguration config, ILogger<UploadStudyMaterialHandler> logger)
        {
            _db = db;
            _ai = ai;
            _config = config;
            _logger = logger;
        }

        public async Task<UploadFileResponseDto> Handle(UploadStudyMaterialCommand cmd, CancellationToken ct)
        {
            var file = cmd.File;
            var maxSizeMb = int.TryParse(_config["AI:MaxFileUploadSizeMb"], out var mb) ? mb : 20;

            if (file.Length > maxSizeMb * 1024 * 1024)
                throw new InvalidOperationException($"File exceeds maximum upload size of {maxSizeMb}MB.");

            // 1. Determine file type
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileType = extension switch
            {
                ".pdf" => "PDF",
                ".txt" or ".md" => "Text",
                _ => "Other"
            };

            // 2. Save to disk
            var uploadDir = _config["AI:UploadDirectory"] ?? "Uploads/StudyMaterials";
            Directory.CreateDirectory(uploadDir);

            var storedFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadDir, storedFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await file.CopyToAsync(stream, ct);

            // 3. Extract text  (read from the already-saved file so the stream is always fresh)
            string extractedText = string.Empty;
            bool isProcessed = false;
            try
            {
                if (fileType == "PDF")
                {
                    // Use the persisted file path — avoids any stream-position issues
                    // that occur when IFormFile is read a second time after CopyToAsync.
                    using var pdfStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                    extractedText = await _ai.ExtractTextFromPdfAsync(pdfStream, ct);

                    if (string.IsNullOrWhiteSpace(extractedText))
                        _logger.LogWarning("PDF yielded no text for {FileName} — it may be a scanned/image-based PDF.", file.FileName);
                    else
                        _logger.LogInformation("PDF text extracted: {Chars} chars from {FileName}.", extractedText.Length, file.FileName);
                }
                else if (fileType == "Text")
                {
                    using var reader = new StreamReader(new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read));
                    extractedText = await reader.ReadToEndAsync(ct);
                }
                isProcessed = !string.IsNullOrWhiteSpace(extractedText);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Text extraction failed for file {FileName}: {Message}", file.FileName, ex.Message);
            }

            // 4. Persist record
            var record = new AiUploadedFile
            {
                UserId = cmd.UserId,
                OriginalFileName = file.FileName,
                StoredFileName = storedFileName,
                FilePath = filePath,
                FileType = fileType,
                ExtractedText = extractedText,
                FileSizeBytes = file.Length,
                UploadedAt = DateTime.UtcNow,
                IsProcessed = isProcessed
            };
            _db.AiUploadedFiles.Add(record);
            await _db.SaveChangesAsync(ct);

            return new UploadFileResponseDto
            {
                Id = record.Id,
                OriginalFileName = record.OriginalFileName,
                FileType = record.FileType,
                FileSizeBytes = record.FileSizeBytes,
                IsProcessed = record.IsProcessed,
                HasExtractedText = !string.IsNullOrEmpty(record.ExtractedText),
                UploadedAt = record.UploadedAt
            };
        }
    }
}
