using StudyStation.API.Data;
using StudyStation.API.Features.Library.Models;

namespace StudyStation.API.Features.Library.Seeders
{
    public static class LibrarySeeder
    {
        public static void Seed(DatabaseContext context)
        {
            if (!context.LibraryCategories.Any())
            {
                context.LibraryCategories.AddRange(
                    new LibraryCategory { Name = "Frontend", Description = "Frontend resources" },
                    new LibraryCategory { Name = "Backend", Description = "Backend resources" }
                );
            }

            if (!context.ResourceTypes.Any())
            {
                context.ResourceTypes.AddRange(
                    new ResourceType { Name = "Video" },
                    new ResourceType { Name = "Article" },
                    new ResourceType { Name = "Book" }
                );
            }

            context.SaveChanges();
        }
    }
}
