using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;

namespace StudyStation.API.Features.SavedItems.Commands
{
    public class UnsaveItemCommandHandler : IRequestHandler<UnsaveItemCommand, bool>
    {
        private readonly DatabaseContext _context;

        public UnsaveItemCommandHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UnsaveItemCommand request, CancellationToken cancellationToken)
        {
            var savedItem = await _context.SavedItems
                .FirstOrDefaultAsync(s => s.Id == request.SavedItemId && s.UserId == request.UserId, cancellationToken);

            if (savedItem == null)
            {
                return false;
            }

            _context.SavedItems.Remove(savedItem);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
