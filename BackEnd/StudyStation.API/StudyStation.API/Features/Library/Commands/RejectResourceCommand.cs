using MediatR;

namespace StudyStation.API.Features.Library.Commands
{
    public class RejectResourceCommand : IRequest<bool>
    {
        public int Id { get; set; }

        public RejectResourceCommand(int id)
        {
            Id = id;
        }
    }
}
