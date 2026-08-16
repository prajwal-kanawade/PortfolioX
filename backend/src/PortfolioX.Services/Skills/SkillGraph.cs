namespace PortfolioX.Services.Skills;

public class SkillGraph
{
    private readonly Dictionary<string, List<string>> _adjacency;

    public SkillGraph()
    {
        _adjacency = BuildAdjacency();
    }

    public List<string> GetRelated(string skill, IEnumerable<string> exclude, int depth = 2, int maxResults = 8)
    {
        var normalizedSkill = Normalize(skill);
        var excluded = exclude.Select(Normalize).ToHashSet();
        excluded.Add(normalizedSkill);

        if (!_adjacency.ContainsKey(normalizedSkill))
            return [];

        var visited = new HashSet<string> { normalizedSkill };
        var queue = new Queue<(string Skill, int Depth)>();
        queue.Enqueue((normalizedSkill, 0));

        var results = new List<string>();

        while (queue.Count > 0 && results.Count < maxResults)
        {
            var (current, currentDepth) = queue.Dequeue();
            if (currentDepth >= depth) continue;

            foreach (var neighbor in _adjacency.GetValueOrDefault(current, []))
            {
                if (!visited.Add(neighbor)) continue;

                if (!excluded.Contains(neighbor))
                    results.Add(neighbor);

                queue.Enqueue((neighbor, currentDepth + 1));
                if (results.Count >= maxResults) break;
            }
        }

        return results;
    }

    private static string Normalize(string skill) => skill.Trim().ToLowerInvariant();

    private static Dictionary<string, List<string>> BuildAdjacency()
    {
        var edges = new (string, string[])[]
        {
            ("javascript", ["typescript", "react", "node.js", "html", "css"]),
            ("typescript", ["javascript", "react", "angular", "node.js"]),
            ("react", ["javascript", "typescript", "redux", "next.js", "css"]),
            ("redux", ["react", "javascript"]),
            ("next.js", ["react", "typescript", "node.js"]),
            ("node.js", ["javascript", "typescript", "express", "mongodb", "sql"]),
            ("express", ["node.js", "javascript", "mongodb"]),
            ("html", ["css", "javascript"]),
            ("css", ["html", "sass", "tailwind css"]),
            ("sass", ["css"]),
            ("tailwind css", ["css", "html"]),
            ("python", ["django", "flask", "pandas", "numpy", "sql", "machine learning"]),
            ("django", ["python", "sql"]),
            ("flask", ["python"]),
            ("pandas", ["python", "numpy", "data analysis"]),
            ("numpy", ["python", "pandas"]),
            ("machine learning", ["python", "pandas", "data analysis", "tensorflow"]),
            ("tensorflow", ["python", "machine learning"]),
            ("data analysis", ["pandas", "sql", "excel"]),
            ("sql", ["mysql", "postgresql", "data analysis"]),
            ("mysql", ["sql"]),
            ("postgresql", ["sql"]),
            ("mongodb", ["node.js", "sql"]),
            ("c#", [".net", "asp.net core", "sql"]),
            (".net", ["c#", "asp.net core"]),
            ("asp.net core", [".net", "c#", "sql"]),
            ("java", ["spring boot", "sql"]),
            ("spring boot", ["java", "sql"]),
            ("git", ["github", "ci/cd"]),
            ("github", ["git", "ci/cd"]),
            ("ci/cd", ["git", "docker"]),
            ("docker", ["kubernetes", "ci/cd"]),
            ("kubernetes", ["docker"]),
            ("figma", ["ui design", "ux design", "prototyping"]),
            ("ui design", ["figma", "ux design", "typography"]),
            ("ux design", ["ui design", "figma", "user research"]),
            ("user research", ["ux design"]),
            ("prototyping", ["figma", "ui design"]),
            ("typography", ["ui design", "graphic design"]),
            ("graphic design", ["typography", "photoshop", "illustrator"]),
            ("photoshop", ["graphic design", "photo editing"]),
            ("illustrator", ["graphic design"]),
            ("photo editing", ["photoshop", "photography"]),
            ("photography", ["photo editing", "lightroom"]),
            ("lightroom", ["photography", "photo editing"]),
            ("copywriting", ["content writing", "seo"]),
            ("content writing", ["copywriting", "editing", "seo"]),
            ("editing", ["content writing", "proofreading"]),
            ("proofreading", ["editing"]),
            ("seo", ["content writing", "copywriting"]),
            ("patient care", ["clinical diagnosis", "medical records"]),
            ("clinical diagnosis", ["patient care", "medical records"]),
            ("medical records", ["patient care", "clinical diagnosis"]),
            ("surgery", ["clinical diagnosis", "patient care"]),
            ("legal research", ["contract law", "litigation"]),
            ("contract law", ["legal research", "negotiation"]),
            ("litigation", ["legal research", "negotiation"]),
            ("negotiation", ["contract law", "litigation"]),
            ("project management", ["agile", "scrum", "communication"]),
            ("agile", ["scrum", "project management"]),
            ("scrum", ["agile", "project management"]),
            ("communication", ["project management", "public speaking"]),
            ("public speaking", ["communication"])
        };

        var adjacency = new Dictionary<string, List<string>>();
        foreach (var (skill, related) in edges)
        {
            if (!adjacency.TryGetValue(skill, out var list))
                adjacency[skill] = list = [];
            list.AddRange(related);
        }

        return adjacency;
    }
}
