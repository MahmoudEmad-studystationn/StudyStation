using MediatR;
using StudyStation.API.Features.Admin.DTOs;

namespace StudyStation.API.Features.Admin.Queries.GetModeration
{
    public class GetModerationQuery : IRequest<List<ModerationItemDto>>
    {
    }
}
