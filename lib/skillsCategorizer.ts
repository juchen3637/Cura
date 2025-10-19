// Categorize skills into Languages, Frameworks, and Tools
export function categorizeSkills(skills: string[]): {
  languages: string[];
  frameworks: string[];
  tools: string[];
} {
  const languages: string[] = [];
  const frameworks: string[] = [];
  const tools: string[] = [];

  const languageKeywords = [
    "python",
    "javascript",
    "typescript",
    "java",
    "c++",
    "c#",
    "ruby",
    "go",
    "rust",
    "swift",
    "kotlin",
    "php",
    "sql",
    "html",
    "css",
    "assembly",
    "scala",
    "r",
    "matlab",
    "shell",
    "bash",
  ];

  const frameworkKeywords = [
    "react",
    "angular",
    "vue",
    "next",
    "nuxt",
    "express",
    "django",
    "flask",
    "spring",
    "laravel",
    "rails",
    "asp.net",
    ".net",
    "spartacus",
    "svelte",
    "jquery",
    "bootstrap",
    "tailwind",
  ];

  skills.forEach((skill) => {
    const lowerSkill = skill.toLowerCase();

    // Check if it's a language
    if (languageKeywords.some((kw) => lowerSkill.includes(kw))) {
      languages.push(skill);
    }
    // Check if it's a framework
    else if (frameworkKeywords.some((kw) => lowerSkill.includes(kw))) {
      frameworks.push(skill);
    }
    // Otherwise it's a tool
    else {
      tools.push(skill);
    }
  });

  return { languages, frameworks, tools };
}

