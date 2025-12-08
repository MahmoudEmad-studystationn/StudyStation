using MediatR;

namespace StudyStation.API.Features.Library.Commands
{
    public class ApproveResourceCommand : IRequest<bool>
    {
        public int Id { get; set; }

        public ApproveResourceCommand(int id)
        {
            Id = id;
        }
    }
}
