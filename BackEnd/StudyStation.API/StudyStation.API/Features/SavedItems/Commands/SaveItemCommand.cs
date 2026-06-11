using MediatR;
using StudyStation.API.Features.SavedItems.DTOs;

namespace StudyStation.API.Features.SavedItems.Commands
{
    public class SaveItemCommand : IRequest<bool>
    {
        public int UserId { get; set; }
        public SaveItemRequest Request { get; set; }
    }
}
