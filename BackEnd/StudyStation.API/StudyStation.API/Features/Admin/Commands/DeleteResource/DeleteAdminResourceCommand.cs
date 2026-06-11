using MediatR;

namespace StudyStation.API.Features.Admin.Commands.DeleteResource
{
    public class DeleteAdminResourceCommand : IRequest<bool>
    {
        public int ResourceId { get; set; }

        public DeleteAdminResourceCommand(int resourceId)
        {
            ResourceId = resourceId;
        }
    }
}
