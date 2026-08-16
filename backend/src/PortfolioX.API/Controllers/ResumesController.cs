using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;
using PortfolioX.Services;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResumesController : ControllerBase
{
    private readonly IResumeService _resumeService;
    private readonly AppDbContext _context;

    public ResumesController(IResumeService resumeService, AppDbContext context)
    {
        _resumeService = resumeService;
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateResume([FromBody] CreateResumeRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var result = await _resumeService.CreateResumeAsync(userId, request);
        return result == null ? BadRequest("Failed to create resume") : CreatedAtAction(nameof(GetResumeById), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetResumeById(Guid id)
    {
        var resume = await _resumeService.GetResumeByIdAsync(id);
        if (resume == null) return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var entity = await _context.Resumes.FindAsync(id);
        if (entity!.UserId != userId) return Forbid();

        return Ok(resume);
    }

    [HttpGet("{id}/score")]
    public async Task<IActionResult> GetScore(Guid id, [FromQuery] string? jobDescription)
    {
        var resume = await _context.Resumes.FindAsync(id);
        if (resume == null) return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (resume.UserId != userId) return Forbid();

        var result = await _resumeService.RecalculateScoreAsync(id, jobDescription);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("my-resumes")]
    public async Task<IActionResult> GetMyResumes()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var resumes = await _resumeService.GetUserResumesAsync(userId);
        return Ok(resumes);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateResume(Guid id, [FromBody] UpdateResumeRequest request)
    {
        var resume = await _context.Resumes.FindAsync(id);
        if (resume == null) return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (resume.UserId != userId) return Forbid();

        var result = await _resumeService.UpdateResumeAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteResume(Guid id)
    {
        var resume = await _context.Resumes.FindAsync(id);
        if (resume == null) return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (resume.UserId != userId) return Forbid();

        await _resumeService.DeleteResumeAsync(id);
        return NoContent();
    }

    [HttpPost("{resumeId}/experience")]
    public async Task<IActionResult> AddExperience(Guid resumeId, [FromBody] CreateResumeExperienceRequest request)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return NotFound("Resume not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (resume.UserId != userId) return Forbid();

        var experience = new ResumeExperience
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            JobTitle = request.JobTitle,
            CompanyName = request.CompanyName,
            Location = request.Location,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsCurrent = request.IsCurrent,
            Bullets = string.Join('\n', request.Bullets),
            SortOrder = 0
        };

        _context.ResumeExperiences.Add(experience);
        await _context.SaveChangesAsync();
        await _resumeService.RecalculateScoreAsync(resumeId, jobDescription: null);

        var updated = await _resumeService.GetResumeByIdAsync(resumeId);
        return CreatedAtAction(nameof(GetResumeById), new { id = resumeId }, updated);
    }

    [HttpPost("{resumeId}/education")]
    public async Task<IActionResult> AddEducation(Guid resumeId, [FromBody] CreateResumeEducationRequest request)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return NotFound("Resume not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (resume.UserId != userId) return Forbid();

        var education = new ResumeEducation
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            Degree = request.Degree,
            University = request.University,
            GraduationDate = request.GraduationDate,
            Bullets = string.Join('\n', request.Bullets),
            SortOrder = 0
        };

        _context.ResumeEducations.Add(education);
        await _context.SaveChangesAsync();
        await _resumeService.RecalculateScoreAsync(resumeId, jobDescription: null);

        var updated = await _resumeService.GetResumeByIdAsync(resumeId);
        return CreatedAtAction(nameof(GetResumeById), new { id = resumeId }, updated);
    }

    [HttpPost("{resumeId}/skills")]
    public async Task<IActionResult> AddSkillCategory(Guid resumeId, [FromBody] CreateResumeSkillCategoryRequest request)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return NotFound("Resume not found");

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (resume.UserId != userId) return Forbid();

        var category = new ResumeSkillCategory
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            CategoryName = request.CategoryName,
            Content = request.Content,
            SortOrder = 0
        };

        _context.ResumeSkillCategories.Add(category);
        await _context.SaveChangesAsync();
        await _resumeService.RecalculateScoreAsync(resumeId, jobDescription: null);

        var updated = await _resumeService.GetResumeByIdAsync(resumeId);
        return CreatedAtAction(nameof(GetResumeById), new { id = resumeId }, updated);
    }
}
