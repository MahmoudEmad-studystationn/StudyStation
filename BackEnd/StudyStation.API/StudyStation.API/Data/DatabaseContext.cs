using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Features.Library.Models;
using StudyStation.API.Models;


namespace StudyStation.API.Data
{
    public class DatabaseContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) { }

        // لا حاجة لـ DbSet<ApplicationUser> لأن IdentityDbContext يضيفه تلقائياً
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<LibraryResource> LibraryResources { get; set; }
        public DbSet<LibraryCategory> LibraryCategories { get; set; }
        public DbSet<ResourceType> ResourceTypes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // احصل على كل العلاقات في النموذج
            var foreignKeys = modelBuilder.Model.GetEntityTypes()
                .SelectMany(e => e.GetForeignKeys());

            // قم بتعطيل الحذف المتتالي لكل العلاقات
            foreach (var foreignKey in foreignKeys)
            {
                foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
            }

            modelBuilder.Entity<Comment>()
               .HasMany(c => c.Replies) // التعليق الواحد لديه العديد من الردود
               .WithOne(c => c.ParentComment) // الرد الواحد له أب واحد
               .HasForeignKey(c => c.ParentCommentId)
               .OnDelete(DeleteBehavior.NoAction);
        }




    }
}
