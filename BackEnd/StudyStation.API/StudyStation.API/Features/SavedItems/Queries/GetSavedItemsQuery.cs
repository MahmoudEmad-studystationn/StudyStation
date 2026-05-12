using MediatR;
using StudyStation.API.Features.SavedItems.DTOs;

namespace StudyStation.API.Features.SavedItems.Queries
{
    public class GetSavedItemsQuery : IRequest<List<SavedItemResponse>>
    {
        public int UserId { get; set; }
    }
}
