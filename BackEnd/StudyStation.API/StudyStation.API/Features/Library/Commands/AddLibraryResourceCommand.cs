using MediatR;

namespace StudyStation.API.Features.Library.Commands
{
    public class AddLibraryResourceCommand : IRequest<int>
    {
        public string Title { get; set; }
        public string Type { get; set; }
        public string Url { get; set; }
        public string FilePath { get; set; }
        public string Description { get; set; }
        // 🔹 الحقول الجديدة
        public int CategoryId { get; set; }
        public int ResourceTypeId { get; set; }
    }
}
