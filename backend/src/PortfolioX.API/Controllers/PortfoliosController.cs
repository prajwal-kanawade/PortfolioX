using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;
using PortfolioX.Services;
using PortfolioX.Services.Skills;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PortfoliosController : ControllerBase
{
    private static readonly string[] AllTimeSlots =
    [
        "09:00 AM", "10:30 AM", "01:15 PM", "02:45 PM", "04:00 PM", "05:30 PM"
    ];

    private const int MaxGalleryPhotos = 5;

    private readonly IPortfolioService _portfolioService;
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IWebHostEnvironment _env;
    private readonly IEmailService _emailService;
    private readonly SkillGraph _skillGraph;
    private readonly ISettingsService _settingsService;
    private readonly IEmailTemplateService _templateService;
    private readonly INotificationService _notificationService;

    public PortfoliosController(IPortfolioService portfolioService, AppDbContext context, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment env, IEmailService emailService, SkillGraph skillGraph, ISettingsService settingsService, IEmailTemplateService templateService, INotificationService notificationService)
    {
        _portfolioService = portfolioService;
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _env = env;
        _emailService = emailService;
        _skillGraph = skillGraph;
        _settingsService = settingsService;
        _templateService = templateService;
        _notificationService = notificationService;
    }

    private bool IsAdmin() => bool.TryParse(User.FindFirst("isadmin")?.Value, out var isAdmin) && isAdmin;

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        var templates = await _portfolioService.GetAllTemplatesAsync();
        return Ok(templates);
    }

    [HttpGet("explore")]
    public async Task<IActionResult> Explore([FromQuery] string? category, [FromQuery] string sort = "trending")
    {
        Guid? viewerId = Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var vid) ? vid : null;
        var results = await _portfolioService.GetExploreAsync(category, sort, viewerId);
        return Ok(results);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreatePortfolio([FromBody] CreatePortfolioRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var result = await _portfolioService.CreatePortfolioAsync(userId, request);

        if (!result.Success)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = result.Error });

        return CreatedAtAction(nameof(GetPortfolioById), new { id = result.Portfolio!.Id }, result.Portfolio);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPortfolioById(Guid id)
    {
        var portfolio = await _portfolioService.GetPortfolioByIdAsync(id);
        if (portfolio == null)
            return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var portfolio_entity = await _context.Portfolios.FindAsync(id);

        if (!portfolio_entity!.IsPublished)
        {
            if (portfolio_entity.UserId != userId && !IsAdmin())
                return Forbid();
        }

        return Ok(portfolio);
    }

    [HttpGet("public/{slug}")]
    public async Task<IActionResult> GetPortfolioBySlug(string slug)
    {
        Guid? viewerId = Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var vid) ? vid : null;
        var portfolio = await _portfolioService.GetPortfolioBySlugAsync(slug, viewerId);
        if (portfolio == null)
            return NotFound();

        var isOwnerPreview = false;
        if (!portfolio.IsPublished)
        {
            var requesterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (requesterId == null) return NotFound();

            var ownerId = await _context.Portfolios.AsNoTracking()
                .Where(p => p.Id == portfolio.Id)
                .Select(p => p.UserId)
                .FirstOrDefaultAsync();

            if (ownerId.ToString() != requesterId && !IsAdmin())
                return NotFound();

            isOwnerPreview = true;
        }

        var sessionViewKey = $"viewed_{portfolio.Id}";
        if (!isOwnerPreview && HttpContext.Session.GetString(sessionViewKey) == null)
        {
            var visitorIp = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            await _portfolioService.RecordPortfolioViewAsync(portfolio.Id, visitorIp);
            HttpContext.Session.SetString(sessionViewKey, "1");
        }

        return Ok(portfolio);
    }

    [HttpGet("{id}/score")]
    public async Task<IActionResult> GetScore(Guid id)
    {
        var result = await _portfolioService.RecalculateScoreAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [Authorize]
    [HttpGet("my-portfolios")]
    public async Task<IActionResult> GetMyPortfolios()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var portfolios = await _portfolioService.GetUserPortfoliosAsync(userId);

        return Ok(portfolios);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePortfolio(Guid id, [FromBody] UpdatePortfolioRequest request)
    {
        var portfolio = await _context.Portfolios.FindAsync(id);
        if (portfolio == null)
            return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        if (request.IsPublished == true && !portfolio.IsPublished)
        {
            var siteSettings = await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1);
            if (siteSettings != null && !siteSettings.AllowPublicPortfolios)
                return BadRequest(new { message = "Publishing portfolios is currently disabled by the site administrator." });
        }

        var result = await _portfolioService.UpdatePortfolioAsync(id, request);
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePortfolio(Guid id)
    {
        var portfolio = await _context.Portfolios.FindAsync(id);
        if (portfolio == null)
            return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        await _portfolioService.DeletePortfolioAsync(id);
        return NoContent();
    }

    [Authorize]
    [HttpPost("{portfolioId}/projects")]
    public async Task<IActionResult> AddProject(Guid portfolioId, [FromBody] CreateProjectRequest request)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var project = new PortfolioProject
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            Title = request.Title,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            ProjectUrl = request.ProjectUrl,
            GithubUrl = request.GithubUrl,
            Technologies = request.Technologies,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            SortOrder = 0
        };

        _context.PortfolioProjects.Add(project);
        await _context.SaveChangesAsync();
        await _portfolioService.RecalculateScoreAsync(portfolioId);

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return CreatedAtAction(nameof(GetPortfolioById), new { id = portfolioId }, updatedPortfolio);
    }

    [Authorize]
    [HttpPost("{portfolioId}/skills")]
    public async Task<IActionResult> AddSkill(Guid portfolioId, [FromBody] CreateSkillRequest request)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var skill = new PortfolioSkill
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            SkillName = request.SkillName,
            ProficiencyLevel = request.ProficiencyLevel,
            SortOrder = 0
        };

        _context.PortfolioSkills.Add(skill);
        await _context.SaveChangesAsync();
        await _portfolioService.RecalculateScoreAsync(portfolioId);

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return CreatedAtAction(nameof(GetPortfolioById), new { id = portfolioId }, updatedPortfolio);
    }

    [Authorize]
    [HttpPost("{portfolioId}/projects/{projectId}/log")]
    public async Task<IActionResult> AddProjectLogEntry(Guid portfolioId, Guid projectId, [FromBody] CreateProjectLogEntryRequest request)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var project = await _context.PortfolioProjects.FirstOrDefaultAsync(p => p.Id == projectId && p.PortfolioId == portfolioId);
        if (project == null)
            return NotFound("Project not found");

        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest("Content is required");

        var logEntry = new ProjectLogEntry
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Content = request.Content
        };

        _context.ProjectLogEntries.Add(logEntry);
        await _context.SaveChangesAsync();

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return CreatedAtAction(nameof(GetPortfolioById), new { id = portfolioId }, updatedPortfolio);
    }

    [Authorize]
    [HttpGet("{portfolioId}/skills/suggestions")]
    public async Task<IActionResult> GetSkillSuggestions(Guid portfolioId)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var currentSkills = await _context.PortfolioSkills
            .AsNoTracking()
            .Where(s => s.PortfolioId == portfolioId)
            .Select(s => s.SkillName)
            .ToListAsync();

        var suggestions = currentSkills
            .SelectMany(skill => _skillGraph.GetRelated(skill, currentSkills))
            .Distinct()
            .Take(8)
            .ToList();

        return Ok(suggestions);
    }

    [Authorize]
    [HttpPost("{portfolioId}/experience")]
    public async Task<IActionResult> AddExperience(Guid portfolioId, [FromBody] CreateExperienceRequest request)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var experience = new PortfolioExperience
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            JobTitle = request.JobTitle,
            CompanyName = request.CompanyName,
            Location = request.Location,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsCurrent = request.IsCurrent,
            SortOrder = 0
        };

        _context.PortfolioExperiences.Add(experience);
        await _context.SaveChangesAsync();
        await _portfolioService.RecalculateScoreAsync(portfolioId);

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return CreatedAtAction(nameof(GetPortfolioById), new { id = portfolioId }, updatedPortfolio);
    }

    [Authorize]
    [HttpPost("{portfolioId}/education")]
    public async Task<IActionResult> AddEducation(Guid portfolioId, [FromBody] CreateEducationRequest request)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var education = new PortfolioEducation
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            InstitutionName = request.InstitutionName,
            Degree = request.Degree,
            FieldOfStudy = request.FieldOfStudy,
            GraduationDate = request.GraduationDate,
            Description = request.Description,
            SortOrder = 0
        };

        _context.PortfolioEducations.Add(education);
        await _context.SaveChangesAsync();
        await _portfolioService.RecalculateScoreAsync(portfolioId);

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return CreatedAtAction(nameof(GetPortfolioById), new { id = portfolioId }, updatedPortfolio);
    }

    [Authorize]
    [HttpPost("{portfolioId}/photo")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> UploadPhoto(Guid portfolioId, IFormFile file)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var uploadError = await ValidateUploadAsync(file);
        if (uploadError != null)
            return BadRequest(uploadError);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var uploadsDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "portfolios");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{portfolioId}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        portfolio.PhotoUrl = $"/uploads/portfolios/{fileName}?v={DateTime.UtcNow.Ticks}";
        portfolio.UpdatedAt = DateTime.UtcNow;
        _context.Portfolios.Update(portfolio);
        await _context.SaveChangesAsync();
        await _portfolioService.RecalculateScoreAsync(portfolioId);

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return Ok(updatedPortfolio);
    }

    [Authorize]
    [HttpPost("{portfolioId}/gallery")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> UploadGalleryPhoto(Guid portfolioId, IFormFile file, [FromForm] string? caption)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var uploadError = await ValidateUploadAsync(file);
        if (uploadError != null)
            return BadRequest(uploadError);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var existingCount = await _context.PortfolioGalleryPhotos.CountAsync(g => g.PortfolioId == portfolioId);
        if (existingCount >= MaxGalleryPhotos)
            return BadRequest($"Maximum of {MaxGalleryPhotos} gallery photos allowed");

        var uploadsDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "portfolios", "gallery", portfolioId.ToString());
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var photo = new PortfolioGalleryPhoto
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            ImageUrl = $"/uploads/portfolios/gallery/{portfolioId}/{fileName}",
            Caption = caption,
            SortOrder = existingCount
        };

        _context.PortfolioGalleryPhotos.Add(photo);
        await _context.SaveChangesAsync();

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return Ok(updatedPortfolio);
    }

    [Authorize]
    [HttpDelete("{portfolioId}/gallery/{photoId}")]
    public async Task<IActionResult> DeleteGalleryPhoto(Guid portfolioId, Guid photoId)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var photo = await _context.PortfolioGalleryPhotos.FirstOrDefaultAsync(g => g.Id == photoId && g.PortfolioId == portfolioId);
        if (photo == null)
            return NotFound("Photo not found");

        var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", photo.ImageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        _context.PortfolioGalleryPhotos.Remove(photo);
        await _context.SaveChangesAsync();

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return Ok(updatedPortfolio);
    }

    [Authorize]
    [HttpPost("{portfolioId}/projects/{projectId}/photo")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> UploadProjectPhoto(Guid portfolioId, Guid projectId, IFormFile file)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var project = await _context.PortfolioProjects.FirstOrDefaultAsync(p => p.Id == projectId && p.PortfolioId == portfolioId);
        if (project == null)
            return NotFound("Project not found");

        var uploadError = await ValidateUploadAsync(file);
        if (uploadError != null)
            return BadRequest(uploadError);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var uploadsDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "portfolios", "projects", portfolioId.ToString());
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{projectId}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        project.ImageUrl = $"/uploads/portfolios/projects/{portfolioId}/{fileName}?v={DateTime.UtcNow.Ticks}";
        _context.PortfolioProjects.Update(project);
        await _context.SaveChangesAsync();

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return Ok(updatedPortfolio);
    }

    [Authorize]
    [HttpPost("{portfolioId}/books")]
    public async Task<IActionResult> AddBook(Guid portfolioId, [FromBody] CreateBookRequest request)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("Title is required");

        var existingCount = await _context.PortfolioBooks.CountAsync(b => b.PortfolioId == portfolioId);

        var book = new PortfolioBook
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            Title = request.Title,
            Description = request.Description,
            Genre = request.Genre,
            PublishedYear = request.PublishedYear,
            SortOrder = existingCount
        };

        _context.PortfolioBooks.Add(book);
        await _context.SaveChangesAsync();

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return CreatedAtAction(nameof(GetPortfolioById), new { id = portfolioId }, updatedPortfolio);
    }

    [Authorize]
    [HttpPost("{portfolioId}/books/{bookId}/cover")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> UploadBookCover(Guid portfolioId, Guid bookId, IFormFile file)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var book = await _context.PortfolioBooks.FirstOrDefaultAsync(b => b.Id == bookId && b.PortfolioId == portfolioId);
        if (book == null)
            return NotFound("Book not found");

        var uploadError = await ValidateUploadAsync(file);
        if (uploadError != null)
            return BadRequest(uploadError);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var uploadsDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "portfolios", "books", portfolioId.ToString());
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{bookId}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        book.CoverImageUrl = $"/uploads/portfolios/books/{portfolioId}/{fileName}?v={DateTime.UtcNow.Ticks}";
        _context.PortfolioBooks.Update(book);
        await _context.SaveChangesAsync();

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return Ok(updatedPortfolio);
    }

    [Authorize]
    [HttpDelete("{portfolioId}/books/{bookId}")]
    public async Task<IActionResult> DeleteBook(Guid portfolioId, Guid bookId)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound("Portfolio not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var book = await _context.PortfolioBooks.FirstOrDefaultAsync(b => b.Id == bookId && b.PortfolioId == portfolioId);
        if (book == null)
            return NotFound("Book not found");

        if (!string.IsNullOrEmpty(book.CoverImageUrl))
        {
            var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", book.CoverImageUrl.Split('?')[0].TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);
        }

        _context.PortfolioBooks.Remove(book);
        await _context.SaveChangesAsync();

        var updatedPortfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return Ok(updatedPortfolio);
    }

    [HttpGet("{portfolioId}/appointments/availability")]
    public async Task<IActionResult> GetAvailability(Guid portfolioId, [FromQuery] DateTime date)
    {
        var day = date.Date;
        var booked = await _context.Appointments
            .AsNoTracking()
            .Where(a => a.PortfolioId == portfolioId && a.AppointmentDate == day && a.Status != "cancelled")
            .Select(a => a.TimeSlot)
            .ToListAsync();

        return Ok(new AvailabilityResponse
        {
            Date = day,
            BookedSlots = booked,
            AllSlots = AllTimeSlots.ToList()
        });
    }

    [HttpPost("{portfolioId}/appointments")]
    public async Task<IActionResult> CreateAppointment(Guid portfolioId, [FromBody] CreateAppointmentRequest request)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null || !portfolio.IsPublished)
            return NotFound("Portfolio not found");

        if (!AllTimeSlots.Contains(request.TimeSlot))
            return BadRequest("Invalid time slot");

        if (request.AppointmentDate.Date < DateTime.UtcNow.Date)
            return BadRequest("Cannot book a date in the past");

        if (!IsValidEmail(request.VisitorEmail))
            return BadRequest(new { message = "Please enter a valid email address." });

        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            VisitorName = request.VisitorName,
            VisitorEmail = request.VisitorEmail,
            Note = request.Note,
            AppointmentDate = request.AppointmentDate.Date,
            TimeSlot = request.TimeSlot,
            Status = "confirmed"
        };

        _context.Appointments.Add(appointment);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict("That time slot was just booked. Please choose another.");
        }

        var (apptSubject, apptHtml) = await _templateService.RenderAsync("appointment_confirmation", new Dictionary<string, string>
        {
            ["visitorName"] = appointment.VisitorName,
            ["portfolioTitle"] = portfolio.Title,
            ["appointmentDate"] = appointment.AppointmentDate.ToString("MMMM d, yyyy"),
            ["timeSlot"] = appointment.TimeSlot,
            ["note"] = string.IsNullOrWhiteSpace(appointment.Note) ? "" : $"<p>Note: {appointment.Note}</p>"
        });

        await _emailService.SendAsync(appointment.VisitorEmail, apptSubject, apptHtml, isHtml: true);

        return CreatedAtAction(nameof(GetAvailability), new { portfolioId }, new AppointmentDto
        {
            Id = appointment.Id,
            VisitorName = appointment.VisitorName,
            VisitorEmail = appointment.VisitorEmail,
            Note = appointment.Note,
            AppointmentDate = appointment.AppointmentDate,
            TimeSlot = appointment.TimeSlot,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt
        });
    }

    [HttpPost("{portfolioId}/contact")]
    public async Task<IActionResult> ContactPortfolioOwner(Guid portfolioId, [FromBody] ContactPortfolioRequest request)
    {
        var portfolio = await _context.Portfolios.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == portfolioId);
        if (portfolio == null || !portfolio.IsPublished)
            return NotFound("Portfolio not found");

        if (string.IsNullOrWhiteSpace(request.VisitorName) || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Name and message are required." });

        if (!IsValidEmail(request.VisitorEmail))
            return BadRequest(new { message = "Please enter a valid email address." });

        var message = new PortfolioContactMessage
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            VisitorName = request.VisitorName,
            VisitorEmail = request.VisitorEmail,
            Message = request.Message
        };

        _context.PortfolioContactMessages.Add(message);
        await _context.SaveChangesAsync();

        var shouldNotify = portfolio.User != null
            && await _settingsService.ShouldSendNotificationAsync(portfolio.User.Id, NotificationKind.ContactMessage);

        if (shouldNotify)
        {
            var (subject, html) = await _templateService.RenderAsync("contact_message", new Dictionary<string, string>
            {
                ["visitorName"] = request.VisitorName,
                ["visitorEmail"] = request.VisitorEmail,
                ["portfolioTitle"] = portfolio.Title,
                ["message"] = request.Message
            });

            await _emailService.SendAsync(portfolio.User!.Email, subject, html, isHtml: true);
        }

        return Ok(new { message = "Your message has been sent." });
    }

    [Authorize]
    [HttpGet("my-views-by-day")]
    public async Task<IActionResult> GetMyViewsByDay()
    {
        const int windowDays = 30;
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var since = DateTime.UtcNow.Date.AddDays(-(windowDays - 1));

        var rawViews = await _context.PortfolioViews
            .Where(v => v.Portfolio!.UserId == userId && v.ViewedAt >= since)
            .GroupBy(v => v.ViewedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        var viewsByDay = Enumerable.Range(0, windowDays)
            .Select(offset => since.AddDays(offset))
            .Select(date => new DayCountDto
            {
                Date = date,
                Count = rawViews.FirstOrDefault(v => v.Date == date)?.Count ?? 0
            })
            .ToList();

        return Ok(viewsByDay);
    }

    [Authorize]
    [HttpGet("{portfolioId}/appointments")]
    public async Task<IActionResult> GetAppointments(Guid portfolioId)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null)
            return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (portfolio.UserId != userId)
            return Forbid();

        var appointments = await _context.Appointments
            .AsNoTracking()
            .Where(a => a.PortfolioId == portfolioId)
            .OrderBy(a => a.AppointmentDate).ThenBy(a => a.TimeSlot)
            .Select(a => new AppointmentDto
            {
                Id = a.Id,
                VisitorName = a.VisitorName,
                VisitorEmail = a.VisitorEmail,
                Note = a.Note,
                AppointmentDate = a.AppointmentDate,
                TimeSlot = a.TimeSlot,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(appointments);
    }

    [Authorize]
    [HttpPost("{id}/like")]
    public async Task<IActionResult> ToggleLike(Guid id)
    {
        var portfolio = await _context.Portfolios.FindAsync(id);
        if (portfolio == null) return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var existing = await _context.PortfolioLikes.FirstOrDefaultAsync(l => l.PortfolioId == id && l.UserId == userId);

        bool liked;
        if (existing != null)
        {
            _context.PortfolioLikes.Remove(existing);
            liked = false;
        }
        else
        {
            _context.PortfolioLikes.Add(new PortfolioLike { Id = Guid.NewGuid(), PortfolioId = id, UserId = userId });
            liked = true;
        }
        await _context.SaveChangesAsync();

        if (liked && portfolio.UserId != userId)
        {
            var liker = await _context.Users.FindAsync(userId);
            await _notificationService.CreateAsync(
                portfolio.UserId,
                "New like",
                $"{liker?.Username} liked your portfolio {portfolio.Title}",
                "like",
                $"/portfolio/{portfolio.Slug}");
        }

        var likeCount = await _context.PortfolioLikes.CountAsync(l => l.PortfolioId == id);
        return Ok(new { liked, likeCount });
    }

    [HttpGet("{id}/likes")]
    public async Task<IActionResult> GetLikes(Guid id)
    {
        var likes = await _context.PortfolioLikes
            .AsNoTracking()
            .Where(l => l.PortfolioId == id)
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new UserChipDto
            {
                UserId = l.UserId,
                Username = l.User!.Username,
                AvatarUrl = l.User.ProfilePhotoUrl
            })
            .ToListAsync();

        return Ok(likes);
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            var address = new System.Net.Mail.MailAddress(email);
            return address.Address == email;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private async Task<string?> ValidateUploadAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return "No file uploaded";

        var siteSettings = await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1);
        var maxMb = siteSettings?.MaxUploadSizeMb ?? 5;
        if (file.Length > (long)maxMb * 1024 * 1024)
            return $"File exceeds the maximum allowed size of {maxMb}MB";

        var allowedExtensions = (siteSettings?.AllowedImageTypes ?? "jpg,jpeg,png,webp")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(t => "." + t.ToLowerInvariant().TrimStart('.'))
            .ToHashSet();

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return $"Only {string.Join(", ", allowedExtensions.Select(t => t.TrimStart('.')))} images are allowed";

        return null;
    }
}
