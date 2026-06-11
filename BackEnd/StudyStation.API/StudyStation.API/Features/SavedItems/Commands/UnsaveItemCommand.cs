using MediatR;

namespace StudyStation.API.Features.SavedItems.Commands
{
    public class UnsaveItemCommand : IRequest<bool>
    {
        public int UserId { get; set; }
        public int SavedItemId { get; set; }
    }
}
