using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Features.Library.Models;
using StudyStation.API.Features.StudyWithFriends.Models;
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

        // Study With Friends
        public DbSet<StudyRoom> StudyRooms { get; set; }
        public DbSet<RoomParticipant> RoomParticipants { get; set; }
        public DbSet<StudyTask> StudyTasks { get; set; }
        public DbSet<RoomMessage> RoomMessages { get; set; }
        public DbSet<FocusSession> FocusSessions { get; set; }

        // Profile Dashboard
        public DbSet<StudyStation.API.Features.Profile.Models.StudyTask> ProfileStudyTasks { get; set; }
        public DbSet<StudyStation.API.Features.Profile.Models.StudySession> StudySessions { get; set; }
        public DbSet<StudyStation.API.Features.Profile.Models.ActivityLog> ActivityLogs { get; set; }

        // Admin features
        public DbSet<StudyStation.API.Features.Admin.Models.FlaggedItem> FlaggedItems { get; set; }

        // Saved Items
        public DbSet<StudyStation.API.Features.SavedItems.Models.SavedItem> SavedItems { get; set; }

        // Notifications
        public DbSet<StudyStation.API.Features.Notifications.Models.Notification> Notifications { get; set; }

        // AI Assistant
        public DbSet<AiConversation> AiConversations { get; set; }
        public DbSet<AiMessage> AiMessages { get; set; }
        public DbSet<AiGeneratedContent> AiGeneratedContent { get; set; }
        public DbSet<AiQuizQuestion> AiQuizQuestions { get; set; }
        public DbSet<AiFlashcard> AiFlashcards { get; set; }
        public DbSet<AiUploadedFile> AiUploadedFiles { get; set; }
        public DbSet<UserLearningMemory> UserLearningMemory { get; set; }
        public DbSet<UserTopicPerformance> UserTopicPerformances { get; set; }

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

            // Study With Friends Configuration
            modelBuilder.Entity<StudyRoom>()
                .HasIndex(r => r.RoomCode)
                .IsUnique();

            modelBuilder.Entity<RoomParticipant>()
                .HasKey(rp => new { rp.RoomId, rp.UserId });

            modelBuilder.Entity<StudyRoom>()
                .HasOne(sr => sr.Owner)
                .WithMany(u => u.OwnedStudyRooms)
                .HasForeignKey(sr => sr.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RoomParticipant>()
                .HasOne(rp => rp.User)
                .WithMany(u => u.RoomParticipations)
                .HasForeignKey(rp => rp.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cascade deletes for StudyRoom dependents
            modelBuilder.Entity<StudyRoom>()
                .HasMany(sr => sr.Participants)
                .WithOne(rp => rp.Room)
                .HasForeignKey(rp => rp.RoomId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudyRoom>()
                .HasMany(sr => sr.Tasks)
                .WithOne(t => t.Room)
                .HasForeignKey(t => t.RoomId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudyRoom>()
                .HasMany(sr => sr.Messages)
                .WithOne(m => m.Room)
                .HasForeignKey(m => m.RoomId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudyRoom>()
                .HasMany(sr => sr.FocusSessions)
                .WithOne(fs => fs.Room)
                .HasForeignKey(fs => fs.RoomId)
                .OnDelete(DeleteBehavior.Cascade);

            // Profile Dashboard Configuration
            modelBuilder.Entity<StudyStation.API.Features.Profile.Models.StudyTask>()
                .ToTable("ProfileStudyTasks");

            // Admin Dashboard Configuration
            modelBuilder.Entity<StudyStation.API.Features.Admin.Models.FlaggedItem>()
                .HasOne(f => f.Reporter)
                .WithMany() // No reverse navigation property
                .HasForeignKey(f => f.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);

            // Saved Items Configuration
            modelBuilder.Entity<StudyStation.API.Features.SavedItems.Models.SavedItem>()
                .HasOne(s => s.User)
                .WithMany(u => u.SavedItems)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudyStation.API.Features.SavedItems.Models.SavedItem>()
                .HasOne(s => s.Post)
                .WithMany()
                .HasForeignKey(s => s.PostId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudyStation.API.Features.SavedItems.Models.SavedItem>()
                .HasOne(s => s.LibraryResource)
                .WithMany()
                .HasForeignKey(s => s.LibraryResourceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Notifications Configuration
            modelBuilder.Entity<StudyStation.API.Features.Notifications.Models.Notification>()
                .HasOne(n => n.Recipient)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.RecipientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudyStation.API.Features.Notifications.Models.Notification>()
                .HasOne(n => n.Sender)
                .WithMany()
                .HasForeignKey(n => n.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // ──────────────────────────────────────────────────────────────
            // AI Feature Configuration
            // ──────────────────────────────────────────────────────────────

            // AiConversation → User (optional, Restrict) — null for shared room conversations
            modelBuilder.Entity<AiConversation>()
                .HasOne(c => c.User)
                .WithMany(u => u.AiConversations)
                .HasForeignKey(c => c.UserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            // AiConversation → Room (optional, Cascade) — set for shared room conversations
            modelBuilder.Entity<AiConversation>()
                .HasOne(c => c.Room)
                .WithMany()
                .HasForeignKey(c => c.RoomId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AiConversation>()
                .HasMany(c => c.Messages)
                .WithOne(m => m.Conversation)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            // AiGeneratedContent → User (Restrict), QuizQuestions + Flashcards (Cascade)
            modelBuilder.Entity<AiGeneratedContent>()
                .HasOne(c => c.User)
                .WithMany(u => u.AiGeneratedContent)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AiGeneratedContent>()
                .HasMany(c => c.QuizQuestions)
                .WithOne(q => q.GeneratedContent)
                .HasForeignKey(q => q.GeneratedContentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AiGeneratedContent>()
                .HasMany(c => c.Flashcards)
                .WithOne(f => f.GeneratedContent)
                .HasForeignKey(f => f.GeneratedContentId)
                .OnDelete(DeleteBehavior.Cascade);

            // AiUploadedFile → User (Restrict)
            modelBuilder.Entity<AiUploadedFile>()
                .HasOne(f => f.User)
                .WithMany(u => u.AiUploadedFiles)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // UserLearningMemory → User (1-to-1, Restrict)
            modelBuilder.Entity<UserLearningMemory>()
                .HasOne(m => m.User)
                .WithOne(u => u.LearningMemory)
                .HasForeignKey<UserLearningMemory>(m => m.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserLearningMemory>()
                .HasIndex(m => m.UserId)
                .IsUnique();

            // UserTopicPerformance → User (Restrict)
            modelBuilder.Entity<UserTopicPerformance>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserTopicPerformance>()
                .HasIndex(p => new { p.UserId, p.Topic });
        }





    }
}