using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Core.Policies;
using PortfolioX.Infrastructure;
using PortfolioX.Services;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly IPortfolioService _portfolioService;
    private readonly IResumeService _resumeService;
    private readonly IAiUsageService _aiUsageService;
    private readonly AppDbContext _context;

    public AiController(IAiService aiService, IPortfolioService portfolioService, IResumeService resumeService, IAiUsageService aiUsageService, AppDbContext context)
    {
        _aiService = aiService;
        _portfolioService = portfolioService;
        _resumeService = resumeService;
        _aiUsageService = aiUsageService;
        _context = context;
    }

    [HttpGet("usage")]
    public async Task<IActionResult> GetUsage()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var (used, limit, resetAt) = await _aiUsageService.GetUsageAsync(userId);
        return Ok(new { used, limit, resetAt });
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] AiChatRequest request)
    {
        var gate = await CheckAiAccessAsync();
        if (gate != null) return gate;

        var result = await _aiService.GetNextReplyAsync(request.Messages);
        return Ok(new AiChatResponse
        {
            Reply = result.Reply,
            ReadyToGenerate = result.Data != null,
            Data = result.Data
        });
    }

    [HttpPost("suggest-template")]
    public async Task<IActionResult> SuggestTemplate([FromBody] AiPortfolioDataDto request)
    {
        var gate = await CheckAiAccessAsync();
        if (gate != null) return gate;

        var code = TemplateMatcher.Match(request);
        var template = await _context.PortfolioTemplates.FirstOrDefaultAsync(t => t.Code == code);

        if (template == null) return NotFound();

        return Ok(new PortfolioTemplateDto
        {
            Id = template.Id,
            Code = template.Code,
            Name = template.Name,
            Description = template.Description,
            Category = template.Category,
            ThumbnailUrl = template.ThumbnailUrl
        });
    }

    [HttpPost("generate-portfolio")]
    public async Task<IActionResult> GeneratePortfolio([FromBody] GeneratePortfolioRequest request)
    {
        var gate = await CheckAiAccessAsync();
        if (gate != null) return gate;

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

        var creationResult = await _portfolioService.CreatePortfolioAsync(userId, new CreatePortfolioRequest
        {
            TemplateId = request.TemplateId,
            Title = request.Data.Title,
            Headline = request.Data.Headline,
            AboutMe = request.Data.AboutMe
        });

        if (!creationResult.Success)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = creationResult.Error });

        var portfolioId = creationResult.Portfolio!.Id;

        foreach (var s in request.Data.Skills)
        {
            _context.PortfolioSkills.Add(new PortfolioSkill
            {
                Id = Guid.NewGuid(),
                PortfolioId = portfolioId,
                SkillName = s.SkillName,
                ProficiencyLevel = s.ProficiencyLevel,
                SortOrder = 0
            });
        }

        foreach (var e in request.Data.Experiences)
        {
            _context.PortfolioExperiences.Add(new PortfolioExperience
            {
                Id = Guid.NewGuid(),
                PortfolioId = portfolioId,
                JobTitle = e.JobTitle,
                CompanyName = e.CompanyName,
                Location = e.Location,
                Description = e.Description,
                StartDate = e.StartDate ?? DateTime.UtcNow,
                EndDate = e.EndDate,
                IsCurrent = e.IsCurrent,
                SortOrder = 0
            });
        }

        foreach (var ed in request.Data.Educations)
        {
            _context.PortfolioEducations.Add(new PortfolioEducation
            {
                Id = Guid.NewGuid(),
                PortfolioId = portfolioId,
                InstitutionName = ed.InstitutionName,
                Degree = ed.Degree,
                FieldOfStudy = ed.FieldOfStudy,
                GraduationDate = ed.GraduationDate,
                Description = ed.Description,
                SortOrder = 0
            });
        }

        foreach (var p in request.Data.Projects)
        {
            _context.PortfolioProjects.Add(new PortfolioProject
            {
                Id = Guid.NewGuid(),
                PortfolioId = portfolioId,
                Title = p.Title,
                Description = p.Description,
                Technologies = p.Technologies,
                SortOrder = 0
            });
        }

        await _context.SaveChangesAsync();

        var portfolio = await _portfolioService.GetPortfolioByIdAsync(portfolioId);
        return Ok(portfolio);
    }

    [HttpPost("resume-chat")]
    public async Task<IActionResult> ResumeChat([FromBody] AiChatRequest request)
    {
        var gate = await CheckAiAccessAsync();
        if (gate != null) return gate;

        var result = await _aiService.GetNextResumeReplyAsync(request.Messages);
        return Ok(new AiResumeChatResponse
        {
            Reply = result.Reply,
            ReadyToGenerate = result.Data != null,
            Data = result.Data
        });
    }

    [HttpPost("generate-resume")]
    public async Task<IActionResult> GenerateResume([FromBody] GenerateResumeRequest request)
    {
        var gate = await CheckAiAccessAsync();
        if (gate != null) return gate;

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

        var created = await _resumeService.CreateResumeAsync(userId, new CreateResumeRequest
        {
            Title = string.IsNullOrWhiteSpace(request.Data.FullName) ? "My Resume" : $"{request.Data.FullName}'s Resume",
            FullName = request.Data.FullName,
            Phone = request.Data.Phone,
            Email = request.Data.Email,
            LinkedInUrl = request.Data.LinkedInUrl,
            Location = request.Data.Location,
            Summary = request.Data.Summary
        });

        if (created == null)
            return BadRequest("Failed to create resume");

        var resumeId = created.Id;

        foreach (var e in request.Data.Experiences)
        {
            _context.ResumeExperiences.Add(new ResumeExperience
            {
                Id = Guid.NewGuid(),
                ResumeId = resumeId,
                JobTitle = e.JobTitle,
                CompanyName = e.CompanyName,
                Location = e.Location,
                StartDate = e.StartDate ?? DateTime.UtcNow,
                EndDate = e.EndDate,
                IsCurrent = e.IsCurrent,
                Bullets = string.Join('\n', e.Bullets),
                SortOrder = 0
            });
        }

        foreach (var ed in request.Data.Educations)
        {
            _context.ResumeEducations.Add(new ResumeEducation
            {
                Id = Guid.NewGuid(),
                ResumeId = resumeId,
                Degree = ed.Degree,
                University = ed.University,
                GraduationDate = ed.GraduationDate,
                Bullets = string.Join('\n', ed.Bullets),
                SortOrder = 0
            });
        }

        foreach (var s in request.Data.SkillCategories)
        {
            _context.ResumeSkillCategories.Add(new ResumeSkillCategory
            {
                Id = Guid.NewGuid(),
                ResumeId = resumeId,
                CategoryName = s.CategoryName,
                Content = s.Content,
                SortOrder = 0
            });
        }

        await _context.SaveChangesAsync();

        var resume = await _resumeService.GetResumeByIdAsync(resumeId);
        return Ok(resume);
    }

    [HttpPost("suggest")]
    public async Task<IActionResult> Suggest([FromBody] AiSuggestRequest request)
    {
        var gate = await CheckAiAccessAsync();
        if (gate != null) return gate;

        var suggestions = await _aiService.GetSuggestionsAsync(request.Category, request.Field, request.Context);
        return Ok(new AiSuggestResponse { Suggestions = suggestions });
    }

    private async Task<IActionResult?> CheckAiAccessAsync()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var policy = SubscriptionPlanPolicyFactory.ForTier(user.SubscriptionTier);
        if (!policy.CanUseAiBuilder) return Forbid();

        var (allowed, _, _, error) = await _aiUsageService.CheckAndConsumeAsync(userId);
        if (!allowed) return StatusCode(StatusCodes.Status403Forbidden, new { message = error });

        return null;
    }
}
