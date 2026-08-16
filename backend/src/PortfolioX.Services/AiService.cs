using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PortfolioX.Core.DTOs;
using PortfolioX.Services.AiProviders;

namespace PortfolioX.Services;

public class AiChatResult
{
    public string Reply { get; set; } = null!;
    public AiPortfolioDataDto? Data { get; set; }
}

public class AiResumeChatResult
{
    public string Reply { get; set; } = null!;
    public AiResumeDataDto? Data { get; set; }
}

public interface IAiService
{
    Task<AiChatResult> GetNextReplyAsync(List<AiChatMessageDto> history);
    Task<AiResumeChatResult> GetNextResumeReplyAsync(List<AiChatMessageDto> history);
    Task<List<string>> GetSuggestionsAsync(string category, string field, string? context);
}

public class AiService : IAiService
{
    private const string PortfolioDataTagOpen = "<PORTFOLIO_DATA>";
    private const string PortfolioDataTagClose = "</PORTFOLIO_DATA>";
    private const string ResumeDataTagOpen = "<RESUME_DATA>";
    private const string ResumeDataTagClose = "</RESUME_DATA>";

    private const string PortfolioSystemPrompt = """
        You are a friendly assistant helping someone build their professional portfolio through conversation.
        Ask questions one at a time, in roughly this order, to gather:
        1) their name and professional title/headline
        2) a short 2-3 sentence bio (about me)
        3) 3-6 skills
        4) 1-3 work experiences (job title, company, location, start date, end date or current, description)
        5) education (institution, degree, field of study, graduation date) - optional, skip if they have none
        6) 1-3 projects (title, description, technologies used)
        Keep each message short and conversational - don't ask for everything at once, and don't repeat questions
        they've already answered.
        Once you have enough information (at minimum: a name/title, one skill, and one experience or project),
        write a brief friendly closing message, then append a machine-readable block in EXACTLY this format at
        the very end of that same message, with real data filled in (use null for genuinely unknown dates):
        <PORTFOLIO_DATA>{"title":"...","headline":"...","aboutMe":"...","skills":[{"skillName":"...","proficiencyLevel":"intermediate"}],"experiences":[{"jobTitle":"...","companyName":"...","location":"...","description":"...","startDate":"2022-01-01","endDate":null,"isCurrent":true}],"educations":[{"institutionName":"...","degree":"...","fieldOfStudy":"...","graduationDate":"2020-06-01","description":"..."}],"projects":[{"title":"...","description":"...","technologies":"..."}]}</PORTFOLIO_DATA>
        Do not include that block in any earlier message - only once, when you are ready to finish.
        """;

    private const string ResumeSystemPrompt = """
        You are a friendly assistant helping someone build a professional resume through a SHORT conversation -
        only a few questions, not a long interview. Ask, one at a time:
        1) their full name and the job title/role they're targeting
        2) contact info: phone, email, LinkedIn URL, location (city/state) - mention any of these can be skipped
        3) ask them to paste or describe their background in their own words - previous jobs, education, and
           skills, in as much or as little detail as they have (an old resume, LinkedIn summary, or rough notes
           all work fine)
        Once you have their name/title and at least some background text, DO NOT ask further questions -
        instead, write everything yourself: draft a polished 2-3 sentence professional summary; extract/infer
        their work experience (job title, company, location, approximate dates, 2-4 achievement-oriented bullet
        points per role using strong action verbs and quantified results where plausible); education; and group
        their skills into 2-3 categories (e.g. "Technical Skills", "Professional Skills", "Languages").
        Write a brief friendly closing message, then append a machine-readable block in EXACTLY this format at
        the very end of that message, with real data filled in (use null for genuinely unknown dates):
        <RESUME_DATA>{"fullName":"...","phone":"...","email":"...","linkedInUrl":"...","location":"...","summary":"...","experiences":[{"jobTitle":"...","companyName":"...","location":"...","startDate":"2022-01-01","endDate":null,"isCurrent":true,"bullets":["...","..."]}],"educations":[{"degree":"...","university":"...","graduationDate":"2020-06-01","bullets":["..."]}],"skillCategories":[{"categoryName":"Technical Skills","content":"..."}]}</RESUME_DATA>
        Do not include that block until you are ready to finish - only once, in your final message.
        """;

    private readonly IConfiguration _configuration;
    private readonly ILogger<AiService> _logger;
    private readonly AiProviderFactory _providerFactory;

    public AiService(IConfiguration configuration, ILogger<AiService> logger, AiProviderFactory providerFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _providerFactory = providerFactory;
    }

    public async Task<AiChatResult> GetNextReplyAsync(List<AiChatMessageDto> history)
    {
        var apiKey = _configuration["Ai:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogInformation("[DEV AI] No Ai:ApiKey configured - using scripted stub reply.");
            return GetStubReply(history);
        }

        var text = await CallProviderAsync(PortfolioSystemPrompt, history, apiKey);
        return ParsePortfolioReply(text);
    }

    public async Task<AiResumeChatResult> GetNextResumeReplyAsync(List<AiChatMessageDto> history)
    {
        var apiKey = _configuration["Ai:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogInformation("[DEV AI] No Ai:ApiKey configured - using scripted resume stub reply.");
            return GetResumeStubReply(history);
        }

        var text = await CallProviderAsync(ResumeSystemPrompt, history, apiKey);
        return ParseResumeReply(text);
    }

    public async Task<List<string>> GetSuggestionsAsync(string category, string field, string? context)
    {
        var apiKey = _configuration["Ai:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogInformation("[DEV AI] No Ai:ApiKey configured - using stub suggestions.");
            return GetStubSuggestions(field);
        }

        var hasContext = !string.IsNullOrWhiteSpace(context);
        var systemPrompt = $"""
            You write short, professional {field} suggestions for a {category} portfolio or resume.
            {(hasContext
                ? $"""
                  The user has already written: "{context}"
                  Every suggestion must be built directly from this - reuse its specific role, industry,
                  skills, or wording where it makes sense, and adapt or extend it rather than ignoring it
                  in favor of generic {category} boilerplate. If two suggestions could apply to any random
                  person in this category regardless of what the user wrote, they're wrong - rewrite them.
                  """
                : $"The user hasn't written anything yet, so write strong general-purpose {field} suggestions for a {category} professional.")}
            Respond with ONLY a JSON array of exactly 8 distinct short string suggestions, covering a
            real range of tones and angles grounded in the above (not 8 minor rewordings of the same
            idea), nothing else - no markdown, no explanation, just the raw JSON array.
            """;

        var text = await CallProviderAsync(systemPrompt, [], apiKey);

        try
        {
            var arrayStart = text.IndexOf('[');
            var arrayEnd = text.LastIndexOf(']');
            if (arrayStart < 0 || arrayEnd < arrayStart) return GetStubSuggestions(field);

            var jsonArray = text[arrayStart..(arrayEnd + 1)];
            var options = JsonSerializer.Deserialize<List<string>>(jsonArray);
            return options is { Count: > 0 } ? options : GetStubSuggestions(field);
        }
        catch (JsonException)
        {
            return GetStubSuggestions(field);
        }
    }

    private static List<string> GetStubSuggestions(string field) =>
    [
        "A strong, results-driven professional with a proven track record.",
        "Passionate about delivering high-quality work and continuous improvement.",
        "Dedicated to solving complex problems with clear, effective solutions.",
        "Detail-oriented professional who thrives on turning ideas into reality.",
        "Collaborative team player with a track record of shipping on time.",
        "Curious, adaptable, and always learning the next thing that matters.",
        "Focused on outcomes that make a measurable difference for users.",
        "Balances big-picture thinking with hands-on execution."
    ];

    private static AiChatResult GetStubReply(List<AiChatMessageDto> history)
    {
        var userMessages = history.Where(m => m.Role == "user").Select(m => m.Content).ToList();
        var turn = userMessages.Count;

        string reply;
        AiPortfolioDataDto? data = null;

        switch (turn)
        {
            case 0:
                reply = "Hi! I'll help you build your portfolio. What's your name and professional title?";
                break;
            case 1:
                reply = "Great! Tell me a bit about yourself - a couple sentences for your \"about me\".";
                break;
            case 2:
                reply = "Nice. What are 3-5 skills you'd like to highlight? (comma-separated is fine)";
                break;
            case 3:
                reply = "Got it. Tell me about your most recent job or role - title and company work well.";
                break;
            case 4:
                reply = "Last one - describe a project you're proud of (name and a short description).";
                break;
            default:
                var titleLine = userMessages.ElementAtOrDefault(0) ?? "My Portfolio";
                var aboutLine = userMessages.ElementAtOrDefault(1) ?? "";
                var skillsLine = userMessages.ElementAtOrDefault(2) ?? "";
                var experienceLine = userMessages.ElementAtOrDefault(3) ?? "";
                var projectLine = userMessages.ElementAtOrDefault(4) ?? "";

                var skills = skillsLine
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Take(6)
                    .Select(s => new AiSkillDto { SkillName = s, ProficiencyLevel = "intermediate" })
                    .ToList();
                if (skills.Count == 0)
                    skills.Add(new AiSkillDto { SkillName = "Communication", ProficiencyLevel = "intermediate" });

                data = new AiPortfolioDataDto
                {
                    Title = titleLine,
                    Headline = titleLine,
                    AboutMe = string.IsNullOrWhiteSpace(aboutLine) ? null : aboutLine,
                    Skills = skills,
                    Experiences = string.IsNullOrWhiteSpace(experienceLine) ? [] :
                    [
                        new AiExperienceDto
                        {
                            JobTitle = "Professional",
                            CompanyName = experienceLine,
                            Description = experienceLine,
                            StartDate = DateTime.UtcNow.AddYears(-2),
                            IsCurrent = true
                        }
                    ],
                    Projects = string.IsNullOrWhiteSpace(projectLine) ? [] :
                    [
                        new AiProjectDto { Title = "Featured Project", Description = projectLine }
                    ]
                };
                reply = "Thanks! I've got everything I need - review the details below and create your portfolio whenever you're ready.";
                break;
        }

        return new AiChatResult { Reply = reply, Data = data };
    }

    private static AiResumeChatResult GetResumeStubReply(List<AiChatMessageDto> history)
    {
        var userMessages = history.Where(m => m.Role == "user").Select(m => m.Content).ToList();
        var turn = userMessages.Count;

        string reply;
        AiResumeDataDto? data = null;

        switch (turn)
        {
            case 0:
                reply = "Hi! Let's build your resume. What's your full name and the job title/role you're targeting?";
                break;
            case 1:
                reply = "Thanks! Any contact info you'd like on it - phone, email, LinkedIn, location? (feel free to skip any)";
                break;
            case 2:
                reply = "Last step - tell me about your background in your own words: past jobs, education, and skills. Paste an old resume or just rough notes, whatever you have.";
                break;
            default:
                var nameLine = userMessages.ElementAtOrDefault(0) ?? "Your Name";
                var contactLine = userMessages.ElementAtOrDefault(1) ?? "";
                var backgroundLine = userMessages.ElementAtOrDefault(2) ?? "";

                data = new AiResumeDataDto
                {
                    FullName = nameLine,
                    Phone = null,
                    Email = null,
                    LinkedInUrl = null,
                    Location = string.IsNullOrWhiteSpace(contactLine) ? null : contactLine,
                    Summary = string.IsNullOrWhiteSpace(backgroundLine)
                        ? "Dedicated professional with a strong track record of delivering results."
                        : backgroundLine,
                    Experiences = [],
                    Educations = [],
                    SkillCategories =
                    [
                        new AiResumeSkillCategoryDto { CategoryName = "Professional Skills", Content = "Communication, Problem Solving, Teamwork" }
                    ]
                };
                reply = "Thanks! I've drafted your resume - review it below and create it whenever you're ready.";
                break;
        }

        return new AiResumeChatResult { Reply = reply, Data = data };
    }

    private Task<string> CallProviderAsync(string systemPrompt, List<AiChatMessageDto> history, string apiKey)
    {
        var provider = _providerFactory.Resolve(_configuration["Ai:Provider"]);
        return provider.CallAsync(systemPrompt, history, apiKey, _configuration["Ai:Model"]);
    }

    private static AiChatResult ParsePortfolioReply(string text)
    {
        if (string.IsNullOrEmpty(text))
            return new AiChatResult { Reply = "Sorry, I'm having trouble connecting right now. Please try again in a moment." };

        var openIndex = text.IndexOf(PortfolioDataTagOpen, StringComparison.Ordinal);
        if (openIndex < 0)
            return new AiChatResult { Reply = text.Trim() };

        var closeIndex = text.IndexOf(PortfolioDataTagClose, openIndex, StringComparison.Ordinal);
        if (closeIndex < 0)
            return new AiChatResult { Reply = text.Trim() };

        var reply = text[..openIndex].Trim();
        var jsonBlock = text[(openIndex + PortfolioDataTagOpen.Length)..closeIndex].Trim();

        try
        {
            var data = JsonSerializer.Deserialize<AiPortfolioDataDto>(jsonBlock, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            return new AiChatResult
            {
                Reply = string.IsNullOrWhiteSpace(reply) ? "Here's your portfolio, ready to go!" : reply,
                Data = data
            };
        }
        catch (JsonException)
        {
            return new AiChatResult { Reply = reply };
        }
    }

    private static AiResumeChatResult ParseResumeReply(string text)
    {
        if (string.IsNullOrEmpty(text))
            return new AiResumeChatResult { Reply = "Sorry, I'm having trouble connecting right now. Please try again in a moment." };

        var openIndex = text.IndexOf(ResumeDataTagOpen, StringComparison.Ordinal);
        if (openIndex < 0)
            return new AiResumeChatResult { Reply = text.Trim() };

        var closeIndex = text.IndexOf(ResumeDataTagClose, openIndex, StringComparison.Ordinal);
        if (closeIndex < 0)
            return new AiResumeChatResult { Reply = text.Trim() };

        var reply = text[..openIndex].Trim();
        var jsonBlock = text[(openIndex + ResumeDataTagOpen.Length)..closeIndex].Trim();

        try
        {
            var data = JsonSerializer.Deserialize<AiResumeDataDto>(jsonBlock, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            return new AiResumeChatResult
            {
                Reply = string.IsNullOrWhiteSpace(reply) ? "Here's your resume, ready to go!" : reply,
                Data = data
            };
        }
        catch (JsonException)
        {
            return new AiResumeChatResult { Reply = reply };
        }
    }
}
