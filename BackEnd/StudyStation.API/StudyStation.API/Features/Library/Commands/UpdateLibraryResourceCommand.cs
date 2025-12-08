using MediatR;

namespace StudyStation.API.Features.Library.Commands
{
    public class UpdateLibraryResourceCommand : IRequest<bool>
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public string Url { get; set; }
        public string FilePath { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public int ResourceTypeId { get; set; }

    }
}

