using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using BCrypt.Net;
using Pomelo.EntityFrameworkCore.MySql;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using PortfolioX.Infrastructure;
using PortfolioX.Services;
using PortfolioX.Services.AiProviders;
using PortfolioX.Services.Scoring;
using PortfolioX.Services.Skills;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), mysqlOptions =>
    {
        mysqlOptions.EnableRetryOnFailure(10, TimeSpan.FromSeconds(30), null);
    })
);

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret not configured");
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = "PortfolioX",
        ValidateAudience = true,
        ValidAudience = "PortfolioXAPI",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.Name = "pfx_session";
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPortfolioService, PortfolioService>();
builder.Services.AddScoped<IResumeService, ResumeService>();
builder.Services.AddScoped<PortfolioScoreCalculator>();
builder.Services.AddScoped<ResumeScoreCalculator>();
builder.Services.AddSingleton<SkillGraph>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IDeviceTrustService, DeviceTrustService>();
builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<ISiteSettingsService, SiteSettingsService>();
builder.Services.AddScoped<IEmailTemplateService, EmailTemplateService>();
builder.Services.AddScoped<IPasswordPolicyService, PasswordPolicyService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<SubscriptionReminderBackgroundService>();
builder.Services.AddScoped<IAiUsageService, AiUsageService>();
builder.Services.AddHttpClient<IRazorpayService, RazorpayService>();
builder.Services.AddHttpClient<GroqProvider>();
builder.Services.AddHttpClient<GeminiProvider>();
builder.Services.AddScoped<AiProviderFactory>();
builder.Services.AddScoped<IAiService, AiService>();

builder.Services.AddHttpContextAccessor();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PortfolioX API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme (Example: 'Bearer 12345abcdef')",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            new string[] { }
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();

    if (!context.PortfolioTemplates.Any())
    {
        var templates = new[]
        {
            new { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Code = "01_MED", Name = "Doctor", Description = "Optimized for medical practitioners", Category = "Healthcare" },
            new { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Code = "02_VIS", Name = "Photographer", Description = "Visual gallery showcase", Category = "Creative" },
            new { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Code = "03_ART", Name = "Graphic Designer", Description = "Case-study focused design", Category = "Design" },
            new { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Code = "04_ENG", Name = "Lawyer", Description = "Professional legal counsel portfolio", Category = "Legal" },
            new { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), Code = "05_DEV", Name = "Developer", Description = "Full-stack developer portfolio", Category = "Technology" },
            new { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), Code = "06_WRIT", Name = "Writer", Description = "Content creator portfolio", Category = "Content" }
        };

        foreach (var template in templates)
        {
            context.PortfolioTemplates.Add(new PortfolioX.Core.Entities.PortfolioTemplate
            {
                Id = template.Id,
                Code = template.Code,
                Name = template.Name,
                Description = template.Description,
                Category = template.Category,
                IsActive = true
            });
        }

        context.SubscriptionPlans.AddRange(
            new PortfolioX.Core.Entities.SubscriptionPlan
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Name = "Free Plan",
                Tier = "free",
                PriceMonthly = 0,
                MaxPortfolios = 1,
                MaxProjects = 5,
                CustomDomain = false,
                AiCredits = 0,
                IsActive = true
            },
            new PortfolioX.Core.Entities.SubscriptionPlan
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                Name = "Pro Plan",
                Tier = "pro",
                PriceMonthly = 1500,
                PriceAnnually = 15000,
                MaxPortfolios = 5,
                MaxProjects = 50,
                CustomDomain = true,
                AiCredits = 100,
                IsActive = true
            }
        );

        context.SaveChanges();
    }

    var newerTemplates = new[]
    {
        new { Id = Guid.Parse("77777777-7777-7777-7777-777777777777"), Code = "07_MUS", Name = "Musician", Description = "Singer-songwriter and performer portfolio", Category = "Music" },
        new { Id = Guid.Parse("88888888-8888-8888-8888-888888888888"), Code = "08_ARC", Name = "Architect", Description = "Residential and cultural design portfolio", Category = "Architecture" },
        new { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Code = "09_FIT", Name = "Fitness Trainer", Description = "Strength coach and personal trainer portfolio", Category = "Fitness" },
        new { Id = Guid.Parse("10101010-1010-1010-1010-101010101010"), Code = "10_CHF", Name = "Chef", Description = "Culinary portfolio for chefs and restaurateurs", Category = "Culinary" }
    };

    foreach (var template in newerTemplates)
    {
        if (context.PortfolioTemplates.Any(t => t.Code == template.Code)) continue;

        context.PortfolioTemplates.Add(new PortfolioX.Core.Entities.PortfolioTemplate
        {
            Id = template.Id,
            Code = template.Code,
            Name = template.Name,
            Description = template.Description,
            Category = template.Category,
            IsActive = true
        });
    }

    context.SaveChanges();

    if (!context.EmailTemplates.Any())
    {
        var emailTemplates = new[]
        {
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "registration_otp",
                Subject = "Verify your email - PortfolioX",
                HtmlBody = "<p>Your verification code is <strong>{{otp}}</strong>. It expires in {{expiryMinutes}} minutes.</p>"
            },
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "password_reset",
                Subject = "Reset your password - PortfolioX",
                HtmlBody = "<p>Your password reset code is <strong>{{otp}}</strong>. It expires in {{expiryMinutes}} minutes.</p>"
            },
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "welcome",
                Subject = "Welcome to PortfolioX",
                HtmlBody = "<p>Hi {{firstName}}, welcome to PortfolioX! <a href=\"{{loginUrl}}\">Log in</a> to get started.</p>"
            },
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "admin_new_registration",
                Subject = "New user registered on {{websiteName}}",
                HtmlBody = "<p>New user {{username}} ({{userEmail}}) just registered on {{websiteName}}.</p>"
            },
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "new_device_login",
                Subject = "Confirm this login - PortfolioX",
                HtmlBody = "<p>We noticed a login from a new device. <a href=\"{{verifyUrl}}\">Click here to confirm it was you</a>.</p>"
            },
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "password_changed",
                Subject = "Your password was changed - PortfolioX",
                HtmlBody = "<p>Your PortfolioX password was just changed. If this wasn't you, reset your password immediately.</p>"
            },
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "subscription_reminder",
                Subject = "Your subscription is expiring soon - PortfolioX",
                HtmlBody = "<p>Hi {{firstName}}, your subscription expires on {{expiryDate}}. <a href=\"{{upgradeUrl}}\">Renew now</a>.</p>"
            },
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "appointment_confirmation",
                Subject = "Appointment booked - {{portfolioTitle}}",
                HtmlBody = "<p>{{visitorName}} booked an appointment on {{appointmentDate}} at {{timeSlot}}.{{note}}</p>"
            },
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "contact_message",
                Subject = "New message about {{portfolioTitle}}",
                HtmlBody = "<p>{{visitorName}} ({{visitorEmail}}) sent you a message:</p><p>{{message}}</p>"
            },
            new PortfolioX.Core.Entities.EmailTemplate
            {
                Id = Guid.NewGuid(),
                TemplateKey = "admin_payment_received",
                Subject = "Payment received on {{websiteName}}",
                HtmlBody = "<p>{{userEmail}} paid {{currency}} {{amount}} for the {{planName}} plan.</p>"
            }
        };

        context.EmailTemplates.AddRange(emailTemplates);
        context.SaveChanges();
    }

    if (!context.Admins.Any(a => a.Email == "admin@portfoliox.com"))
    {
        context.Admins.Add(new PortfolioX.Core.Entities.Admin
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000000"),
            Email = "admin@portfoliox.com",
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "Admin",
            LastName = "User",
            IsActive = true
        });
        context.SaveChanges();
    }

    if (!context.Users.Any(u => u.Email == "user@portfoliox.com"))
    {
        var demoUserId = Guid.Parse("99999999-9999-9999-9999-999999999999");
        var demoPortfolioId = Guid.Parse("88888888-8888-8888-8888-888888888888");

        context.Users.Add(new PortfolioX.Core.Entities.User
        {
            Id = demoUserId,
            Email = "user@portfoliox.com",
            Username = "testuser",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
            FirstName = "John",
            LastName = "Doe",
            Bio = "Full-stack developer",
            SubscriptionTier = "free",
            IsActive = true
        });

        context.UserSubscriptions.Add(new PortfolioX.Core.Entities.UserSubscription
        {
            Id = Guid.Parse("99999999-9999-9999-9999-999999999998"),
            UserId = demoUserId,
            PlanId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            Status = "active",
            AutoRenew = true
        });

        context.Portfolios.Add(new PortfolioX.Core.Entities.Portfolio
        {
            Id = demoPortfolioId,
            UserId = demoUserId,
            TemplateId = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            Title = "John Doe Portfolio",
            Slug = "john-doe-portfolio",
            Headline = "Full-Stack Developer | React & .NET Expert",
            AboutMe = "I build beautiful, scalable web applications.",
            IsPublished = true
        });

        context.PortfolioProjects.AddRange(
            new PortfolioX.Core.Entities.PortfolioProject { Id = Guid.Parse("77777777-7777-7777-7777-777777777777"), PortfolioId = demoPortfolioId, Title = "PortfolioX", Description = "Full-stack portfolio builder platform", Technologies = "React, .NET 8, MySQL, JWT", SortOrder = 1 },
            new PortfolioX.Core.Entities.PortfolioProject { Id = Guid.Parse("76666666-6666-6666-6666-666666666666"), PortfolioId = demoPortfolioId, Title = "E-Commerce Platform", Description = "Modern e-commerce solution", Technologies = "React, Node.js, PostgreSQL", SortOrder = 2 }
        );

        context.PortfolioSkills.AddRange(
            new PortfolioX.Core.Entities.PortfolioSkill { Id = Guid.Parse("75555555-5555-5555-5555-555555555555"), PortfolioId = demoPortfolioId, SkillName = "React", ProficiencyLevel = "expert", SortOrder = 1 },
            new PortfolioX.Core.Entities.PortfolioSkill { Id = Guid.Parse("74444444-4444-4444-4444-444444444444"), PortfolioId = demoPortfolioId, SkillName = "ASP.NET Core", ProficiencyLevel = "expert", SortOrder = 2 },
            new PortfolioX.Core.Entities.PortfolioSkill { Id = Guid.Parse("73333333-3333-3333-3333-333333333333"), PortfolioId = demoPortfolioId, SkillName = "MySQL", ProficiencyLevel = "advanced", SortOrder = 3 },
            new PortfolioX.Core.Entities.PortfolioSkill { Id = Guid.Parse("72222222-2222-2222-2222-222222222222"), PortfolioId = demoPortfolioId, SkillName = "JavaScript", ProficiencyLevel = "expert", SortOrder = 4 }
        );

        context.PortfolioExperiences.AddRange(
            new PortfolioX.Core.Entities.PortfolioExperience { Id = Guid.Parse("71111111-1111-1111-1111-111111111111"), PortfolioId = demoPortfolioId, JobTitle = "Senior Developer", CompanyName = "Tech Company", Location = "San Francisco, CA", Description = "Led development of multiple features", StartDate = new DateTime(2022, 1, 15), IsCurrent = true, SortOrder = 1 },
            new PortfolioX.Core.Entities.PortfolioExperience { Id = Guid.Parse("70000000-0000-0000-0000-000000000000"), PortfolioId = demoPortfolioId, JobTitle = "Junior Developer", CompanyName = "StartUp Inc", Location = "New York, NY", Description = "Built web applications", StartDate = new DateTime(2020, 6, 1), IsCurrent = false, SortOrder = 2 }
        );

        context.PortfolioEducations.Add(
            new PortfolioX.Core.Entities.PortfolioEducation { Id = Guid.Parse("69999999-9999-9999-9999-999999999999"), PortfolioId = demoPortfolioId, InstitutionName = "University of Technology", Degree = "Bachelor", FieldOfStudy = "Computer Science", GraduationDate = new DateTime(2020, 5, 20), SortOrder = 1 }
        );

        context.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<PortfolioX.API.Middleware.ExceptionLoggingMiddleware>();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
