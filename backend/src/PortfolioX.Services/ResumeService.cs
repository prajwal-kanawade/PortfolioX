using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;
using PortfolioX.Services.Scoring;

namespace PortfolioX.Services;

public interface IResumeService
{
    Task<ResumeDto?> CreateResumeAsync(Guid userId, CreateResumeRequest request);
    Task<ResumeDto?> GetResumeByIdAsync(Guid resumeId);
    Task<IEnumerable<ResumeDto>> GetUserResumesAsync(Guid userId);
    Task<ResumeDto?> UpdateResumeAsync(Guid resumeId, UpdateResumeRequest request);
    Task<bool> DeleteResumeAsync(Guid resumeId);
    Task<ScoreResultDto?> RecalculateScoreAsync(Guid resumeId, string? jobDescription);
}

public class ResumeService : IResumeService
{
    private readonly AppDbContext _context;
    private readonly ResumeScoreCalculator _scoreCalculator;

    public ResumeService(AppDbContext context, ResumeScoreCalculator scoreCalculator)
    {
        _context = context;
        _scoreCalculator = scoreCalculator;
    }

    public async Task<ResumeDto?> CreateResumeAsync(Guid userId, CreateResumeRequest request)
    {
        var resume = new Resume
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title,
            FullName = request.FullName,
            Phone = request.Phone,
            Email = request.Email,
            LinkedInUrl = request.LinkedInUrl,
            Location = request.Location,
            Summary = request.Summary,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Resumes.Add(resume);
        await _context.SaveChangesAsync();

        return await GetResumeByIdAsync(resume.Id);
    }

    public async Task<ResumeDto?> GetResumeByIdAsync(Guid resumeId)
    {
        var resume = await _context.Resumes
            .AsNoTracking()
            .Include(r => r.Experiences.OrderBy(x => x.SortOrder))
            .Include(r => r.Educations.OrderBy(x => x.SortOrder))
            .Include(r => r.SkillCategories.OrderBy(x => x.SortOrder))
            .FirstOrDefaultAsync(r => r.Id == resumeId);

        return resume == null ? null : MapResumeToDto(resume);
    }

    public async Task<IEnumerable<ResumeDto>> GetUserResumesAsync(Guid userId)
    {
        var resumes = await _context.Resumes
            .AsNoTracking()
            .Where(r => r.UserId == userId)
            .Include(r => r.Experiences)
            .Include(r => r.Educations)
            .Include(r => r.SkillCategories)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return resumes.Select(MapResumeToDto).ToList();
    }

    public async Task<ResumeDto?> UpdateResumeAsync(Guid resumeId, UpdateResumeRequest request)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return null;

        resume.Title = request.Title ?? resume.Title;
        resume.TemplateCode = request.TemplateCode ?? resume.TemplateCode;
        resume.FullName = request.FullName ?? resume.FullName;
        resume.Phone = request.Phone ?? resume.Phone;
        resume.Email = request.Email ?? resume.Email;
        resume.LinkedInUrl = request.LinkedInUrl ?? resume.LinkedInUrl;
        resume.Location = request.Location ?? resume.Location;
        resume.Summary = request.Summary ?? resume.Summary;
        resume.UpdatedAt = DateTime.UtcNow;

        _context.Resumes.Update(resume);
        await _context.SaveChangesAsync();

        await RecalculateScoreAsync(resumeId, jobDescription: null);
        return await GetResumeByIdAsync(resumeId);
    }

    public async Task<ScoreResultDto?> RecalculateScoreAsync(Guid resumeId, string? jobDescription)
    {
        var dto = await GetResumeByIdAsync(resumeId);
        if (dto == null) return null;

        var result = _scoreCalculator.Calculate(dto, jobDescription);

        var entity = await _context.Resumes.FindAsync(resumeId);
        if (entity != null)
        {
            entity.AtsScore = result.Score;
            await _context.SaveChangesAsync();
        }

        return result;
    }

    public async Task<bool> DeleteResumeAsync(Guid resumeId)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return false;

        _context.Resumes.Remove(resume);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ResumeDto MapResumeToDto(Resume resume) => new()
    {
        Id = resume.Id,
        Title = resume.Title,
        IsPrimary = resume.IsPrimary,
        AtsScore = resume.AtsScore,
        TemplateCode = resume.TemplateCode,
        FullName = resume.FullName,
        Phone = resume.Phone,
        Email = resume.Email,
        LinkedInUrl = resume.LinkedInUrl,
        Location = resume.Location,
        Summary = resume.Summary,
        Experiences = resume.Experiences.Select(e => new ResumeExperienceDto
        {
            Id = e.Id,
            JobTitle = e.JobTitle,
            CompanyName = e.CompanyName,
            Location = e.Location,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            IsCurrent = e.IsCurrent,
            Bullets = SplitBullets(e.Bullets)
        }).ToList(),
        Educations = resume.Educations.Select(ed => new ResumeEducationDto
        {
            Id = ed.Id,
            Degree = ed.Degree,
            University = ed.University,
            GraduationDate = ed.GraduationDate,
            Bullets = SplitBullets(ed.Bullets)
        }).ToList(),
        SkillCategories = resume.SkillCategories.Select(s => new ResumeSkillCategoryDto
        {
            Id = s.Id,
            CategoryName = s.CategoryName,
            Content = s.Content
        }).ToList(),
        CreatedAt = resume.CreatedAt,
        UpdatedAt = resume.UpdatedAt
    };

    private static List<string> SplitBullets(string? bullets) =>
        string.IsNullOrWhiteSpace(bullets)
            ? []
            : bullets.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
}
