using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.Entities;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace PortfolioX.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<AdminRefreshToken> AdminRefreshTokens => Set<AdminRefreshToken>();
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<PortfolioTemplate> PortfolioTemplates => Set<PortfolioTemplate>();
    public DbSet<PortfolioProject> PortfolioProjects => Set<PortfolioProject>();
    public DbSet<ProjectLogEntry> ProjectLogEntries => Set<ProjectLogEntry>();
    public DbSet<PortfolioContactMessage> PortfolioContactMessages => Set<PortfolioContactMessage>();
    public DbSet<PortfolioSkill> PortfolioSkills => Set<PortfolioSkill>();
    public DbSet<PortfolioExperience> PortfolioExperiences => Set<PortfolioExperience>();
    public DbSet<PortfolioEducation> PortfolioEducations => Set<PortfolioEducation>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<CoverLetter> CoverLetters => Set<CoverLetter>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PortfolioView> PortfolioViews => Set<PortfolioView>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<TrustedDevice> TrustedDevices => Set<TrustedDevice>();
    public DbSet<LoginVerificationToken> LoginVerificationTokens => Set<LoginVerificationToken>();
    public DbSet<LoginAuditLog> LoginAuditLogs => Set<LoginAuditLog>();
    public DbSet<EmailVerificationOtp> EmailVerificationOtps => Set<EmailVerificationOtp>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<PortfolioGalleryPhoto> PortfolioGalleryPhotos => Set<PortfolioGalleryPhoto>();
    public DbSet<PortfolioBook> PortfolioBooks => Set<PortfolioBook>();
    public DbSet<ResumeExperience> ResumeExperiences => Set<ResumeExperience>();
    public DbSet<ResumeEducation> ResumeEducations => Set<ResumeEducation>();
    public DbSet<ResumeSkillCategory> ResumeSkillCategories => Set<ResumeSkillCategory>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<UserComplaint> UserComplaints => Set<UserComplaint>();
    public DbSet<BugReport> BugReports => Set<BugReport>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();
    public DbSet<PortfolioLike> PortfolioLikes => Set<PortfolioLike>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<CommentLike> CommentLikes => Set<CommentLike>();
    public DbSet<UserFollow> UserFollows => Set<UserFollow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var tableName = entity.GetTableName() ?? entity.ClrType.Name;
            entity.SetTableName(ToSnakeCase(tableName));

            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.Name));
            }

            foreach (var key in entity.GetKeys())
            {
                var keyName = key.GetName();
                if (!string.IsNullOrEmpty(keyName)) key.SetName(ToSnakeCase(keyName));
            }

            foreach (var fk in entity.GetForeignKeys())
            {
                var fkName = fk.GetConstraintName();
                if (!string.IsNullOrEmpty(fkName)) fk.SetConstraintName(ToSnakeCase(fkName));
            }

            foreach (var index in entity.GetIndexes())
            {
                var idxName = index.GetDatabaseName();
                if (!string.IsNullOrEmpty(idxName)) index.SetDatabaseName(ToSnakeCase(idxName));
            }
        }

        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
        });

        modelBuilder.Entity<Admin>(entity =>
        {
            entity.ToTable("admins");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
        });

        modelBuilder.Entity<AdminRefreshToken>(entity =>
        {
            entity.ToTable("admin_refresh_tokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.Admin).WithMany(a => a.RefreshTokens).HasForeignKey(e => e.AdminId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Portfolio>(entity =>
        {
            entity.ToTable("portfolios");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasOne(e => e.User).WithMany(u => u.Portfolios).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Template).WithMany(t => t.Portfolios).HasForeignKey(e => e.TemplateId);
        });

        modelBuilder.Entity<PortfolioTemplate>(entity =>
        {
            entity.ToTable("portfolio_templates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
        });

        modelBuilder.Entity<PortfolioProject>(entity =>
        {
            entity.ToTable("portfolio_projects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Projects).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProjectLogEntry>(entity =>
        {
            entity.ToTable("project_log_entries");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();
            entity.HasOne(e => e.Project).WithMany(p => p.LogEntries).HasForeignKey(e => e.ProjectId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortfolioContactMessage>(entity =>
        {
            entity.ToTable("portfolio_contact_messages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.VisitorName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.VisitorEmail).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Message).IsRequired();
            entity.HasOne(e => e.Portfolio).WithMany().HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserSettings>(entity =>
        {
            entity.ToTable("user_settings");
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.AccentColor).IsRequired().HasMaxLength(20);
            entity.Property(e => e.FontSize).IsRequired().HasMaxLength(10);
            entity.HasOne(e => e.User).WithOne(u => u.Settings).HasForeignKey<UserSettings>(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.DefaultTemplate).WithMany().HasForeignKey(e => e.DefaultTemplateId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SiteSettings>(entity =>
        {
            entity.ToTable("site_settings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.WebsiteName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ActiveLogoKey).IsRequired().HasMaxLength(30);
            entity.Property(e => e.AllowedImageTypes).IsRequired().HasMaxLength(100);
            entity.HasOne(e => e.DefaultTemplate).WithMany().HasForeignKey(e => e.DefaultTemplateId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<EmailTemplate>(entity =>
        {
            entity.ToTable("email_templates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TemplateKey).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.TemplateKey).IsUnique();
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(255);
            entity.Property(e => e.HtmlBody).IsRequired();
        });

        modelBuilder.Entity<ErrorLog>(entity =>
        {
            entity.ToTable("error_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired();
        });

        modelBuilder.Entity<UserComplaint>(entity =>
        {
            entity.ToTable("user_complaints");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired();
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BugReport>(entity =>
        {
            entity.ToTable("bug_reports");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).IsRequired();
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortfolioSkill>(entity =>
        {
            entity.ToTable("portfolio_skills");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SkillName).IsRequired().HasMaxLength(100);
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Skills).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortfolioExperience>(entity =>
        {
            entity.ToTable("portfolio_experience");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.JobTitle).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(255);
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Experiences).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortfolioEducation>(entity =>
        {
            entity.ToTable("portfolio_education");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InstitutionName).IsRequired().HasMaxLength(255);
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Educations).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Resume>(entity =>
        {
            entity.ToTable("resumes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.HasOne(e => e.User).WithMany(u => u.Resumes).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ResumeExperience>(entity =>
        {
            entity.ToTable("resume_experiences");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.JobTitle).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(255);
            entity.HasOne(e => e.Resume).WithMany(r => r.Experiences).HasForeignKey(e => e.ResumeId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ResumeEducation>(entity =>
        {
            entity.ToTable("resume_educations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Degree).IsRequired().HasMaxLength(255);
            entity.Property(e => e.University).IsRequired().HasMaxLength(255);
            entity.HasOne(e => e.Resume).WithMany(r => r.Educations).HasForeignKey(e => e.ResumeId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ResumeSkillCategory>(entity =>
        {
            entity.ToTable("resume_skill_categories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CategoryName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Content).IsRequired();
            entity.HasOne(e => e.Resume).WithMany(r => r.SkillCategories).HasForeignKey(e => e.ResumeId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CoverLetter>(entity =>
        {
            entity.ToTable("cover_letters");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Content).IsRequired();
            entity.HasOne(e => e.User).WithMany(u => u.CoverLetters).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.NotificationType).IsRequired().HasMaxLength(30);
            entity.Property(e => e.Link).HasMaxLength(500);
            entity.HasOne(e => e.User).WithMany(u => u.Notifications).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SubscriptionPlan>(entity =>
        {
            entity.ToTable("subscription_plans");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Tier).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Tier).IsUnique();
        });

        modelBuilder.Entity<UserSubscription>(entity =>
        {
            entity.ToTable("user_subscriptions");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User).WithOne(u => u.Subscription).HasForeignKey<UserSubscription>(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Plan).WithMany(p => p.UserSubscriptions).HasForeignKey(e => e.PlanId);
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.ToTable("payments");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User).WithMany(u => u.Payments).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Subscription).WithMany().HasForeignKey(e => e.SubscriptionId);
        });

        modelBuilder.Entity<PortfolioView>(entity =>
        {
            entity.ToTable("portfolio_views");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Views).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.ToTable("feedback");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Feedbacks).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.User).WithMany(u => u.RefreshTokens).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TrustedDevice>(entity =>
        {
            entity.ToTable("trusted_devices");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DeviceId).IsRequired().HasMaxLength(64);
            entity.HasIndex(e => new { e.UserId, e.DeviceId }).IsUnique();
            entity.HasOne(e => e.User).WithMany(u => u.TrustedDevices).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LoginVerificationToken>(entity =>
        {
            entity.ToTable("login_verification_tokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TokenHash).IsRequired().HasMaxLength(64);
            entity.Property(e => e.DeviceId).IsRequired().HasMaxLength(64);
            entity.HasIndex(e => e.TokenHash);
            entity.HasOne(e => e.User).WithMany(u => u.LoginVerificationTokens).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LoginAuditLog>(entity =>
        {
            entity.ToTable("login_audit_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<EmailVerificationOtp>(entity =>
        {
            entity.ToTable("email_verification_otps");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.OtpHash).IsRequired().HasMaxLength(64);
            entity.HasIndex(e => e.Email);
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.ToTable("password_reset_tokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OtpHash).IsRequired().HasMaxLength(64);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.ToTable("appointments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.VisitorName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.VisitorEmail).IsRequired().HasMaxLength(255);
            entity.Property(e => e.TimeSlot).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => new { e.PortfolioId, e.AppointmentDate, e.TimeSlot }).IsUnique();
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Appointments).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortfolioGalleryPhoto>(entity =>
        {
            entity.ToTable("portfolio_gallery_photos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ImageUrl).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Caption).HasMaxLength(255);
            entity.HasOne(e => e.Portfolio).WithMany(p => p.GalleryPhotos).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortfolioBook>(entity =>
        {
            entity.ToTable("portfolio_books");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Genre).HasMaxLength(100);
            entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Books).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortfolioLike>(entity =>
        {
            entity.ToTable("portfolio_likes");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.PortfolioId, e.UserId }).IsUnique();
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Likes).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.User).WithMany(u => u.PortfolioLikes).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.ToTable("comments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();
            entity.HasOne(e => e.Portfolio).WithMany(p => p.Comments).HasForeignKey(e => e.PortfolioId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.User).WithMany(u => u.Comments).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.ParentComment).WithMany(c => c.Replies).HasForeignKey(e => e.ParentCommentId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CommentLike>(entity =>
        {
            entity.ToTable("comment_likes");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.CommentId, e.UserId }).IsUnique();
            entity.HasOne(e => e.Comment).WithMany(c => c.Likes).HasForeignKey(e => e.CommentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.User).WithMany(u => u.CommentLikes).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserFollow>(entity =>
        {
            entity.ToTable("user_follows");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.FollowerId, e.FolloweeId }).IsUnique();
            entity.HasOne(e => e.Follower).WithMany(u => u.Following).HasForeignKey(e => e.FollowerId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Followee).WithMany(u => u.Followers).HasForeignKey(e => e.FolloweeId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static string ToSnakeCase(string? input)
    {
        if (string.IsNullOrEmpty(input)) return input ?? string.Empty;

        var sb = new System.Text.StringBuilder();
        for (int i = 0; i < input.Length; i++)
        {
            var c = input[i];
            if (char.IsUpper(c))
            {
                if (i > 0) sb.Append('_');
                sb.Append(char.ToLowerInvariant(c));
            }
            else
            {
                sb.Append(c);
            }
        }
        return sb.ToString();
    }
}
