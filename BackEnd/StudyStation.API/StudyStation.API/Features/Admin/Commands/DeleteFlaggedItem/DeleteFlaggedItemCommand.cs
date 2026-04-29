using MediatR;

namespace StudyStation.API.Features.Admin.Commands.DeleteFlaggedItem
{
    public class DeleteFlaggedItemCommand : IRequest<bool>
    {
        public int FlaggedItemId { get; set; }

        public DeleteFlaggedItemCommand(int id)
        {
            FlaggedItemId = id;
        }
    }
}
