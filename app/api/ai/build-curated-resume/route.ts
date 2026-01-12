import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  complete,
  getActiveProvider,
  isProviderConfigured,
  parseJSONResponse,
  AIProvider,
} from "@/lib/aiProvider";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { jobDescription, preferences, provider: requestedProvider } = await req.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    // Determine which provider to use
    const provider: AIProvider = requestedProvider || getActiveProvider();

    if (!isProviderConfigured(provider)) {
      const envVar = provider === "anthropic" ? "ANTHROPIC_API_KEY" : "GOOGLE_AI_API_KEY";
      return NextResponse.json(
        { error: `AI provider "${provider}" is not configured. Please set ${envVar}.` },
        { status: 503 }
      );
    }

    // Get user's profile data
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch all profile data
    const [
      { data: experiences },
      { data: education },
      { data: projects },
      { data: skillCategories },
      { data: profile },
    ] = await Promise.all([
      supabase.from("experiences").select("*").eq("user_id", user.id).eq("is_archived", false),
      supabase.from("education").select("*").eq("user_id", user.id).eq("is_archived", false),
      supabase.from("projects").select("*").eq("user_id", user.id).eq("is_archived", false),
      supabase.from("skill_categories").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    if (!experiences || !education || !projects || !skillCategories) {
      return NextResponse.json(
        { error: "Failed to fetch profile data" },
        { status: 500 }
      );
    }

    // Log profile data counts for debugging
    console.log("Profile data counts:", {
      experiences: experiences.length,
      education: education.length,
      projects: projects.length,
      skillCategories: skillCategories.length,
    });

    // Build prompt for AI
    const prompt = `You are an expert resume builder and career counselor. You will help create an optimized resume from a candidate's profile data.

USER'S PROFILE DATA:

EXPERIENCES (${experiences.length} total):
${experiences.map((exp, idx) => `
${idx + 1}. ID: ${exp.id}
   ${exp.role} at ${exp.company}
   Location: ${exp.location || "N/A"}
   Duration: ${exp.start_date} to ${exp.end_date || "Present"}
   Bullets:
   ${exp.bullets.map((b: string) => `   • ${b}`).join("\n")}
`).join("\n")}

EDUCATION (${education.length} total):
${education.map((edu, idx) => `
${idx + 1}. ID: ${edu.id}
   ${edu.degree}
   Institution: ${edu.institution}
   Location: ${edu.location || "N/A"}
   Duration: ${edu.start_date || "N/A"} to ${edu.end_date || "N/A"}
`).join("\n")}

PROJECTS (${projects.length} total):
${projects.map((proj, idx) => `
${idx + 1}. ID: ${proj.id}
   ${proj.name}
   Link: ${proj.link || "N/A"}
   Description:
   ${proj.bullets.map((b: string) => `   • ${b}`).join("\n")}
`).join("\n")}

SKILLS:
${skillCategories.map(cat => `
ID: ${cat.id} | ${cat.name}: ${cat.skills.join(", ")}
`).join("\n")}

JOB DESCRIPTION:
${jobDescription}

TASK:
Analyze the job description and select the most relevant items from the candidate's profile to create an optimized, tailored resume.

Consider:
1. Required skills and technologies mentioned in the job description
2. Years of experience requirements
3. Industry and domain alignment
4. Specific achievements that demonstrate relevant capabilities
5. Keywords for ATS optimization

Selection Guidelines:
- Select ${preferences?.maxExperiences || 3} most relevant work experiences
- Include all education entries unless clearly irrelevant
- Select ${preferences?.maxProjects || 2} most impressive/relevant projects
- Choose skill categories that match the job requirements

For each selected experience and project, you may tailor the bullet points to better highlight job-relevant achievements. Keep the core facts but emphasize relevant aspects.

Return a JSON response with this EXACT structure:
{
  "selectedExperiences": ["experience_id_1", "experience_id_2", ...],
  "selectedEducation": ["education_id_1", ...],
  "selectedProjects": ["project_id_1", "project_id_2"],
  "selectedSkillCategories": ["skill_category_id_1", ...],
  "tailoredContent": {
    "experiences": {
      "experience_id_1": {
        "bullets": ["tailored bullet 1", "tailored bullet 2", ...]
      }
    },
    "projects": {
      "project_id_1": {
        "bullets": ["tailored bullet 1", ...]
      }
    }
  },
  "reasoning": "2-3 sentences explaining why these items were selected and how they match the job requirements"
}

CRITICAL INSTRUCTIONS:
- Use the EXACT UUID IDs (the long strings like "550e8400-e29b-41d4-a716-446655440000") from the "ID:" fields in the profile data above
- DO NOT use numbers like 1, 2, 3 - use the actual UUID strings shown after "ID:" in each entry
- For skill categories, use the UUID ID strings, NOT the category names
- Only select items that exist in the profile
- Tailor bullets to emphasize job-relevant achievements, but keep them factual
- Return ONLY the JSON object, no additional text`;

    const responseText = await complete(prompt, {
      provider,
      maxTokens: 4000,
    });

    // Parse the JSON response
    let selection;
    try {
      selection = parseJSONResponse(responseText);
      console.log("AI Selection:", selection);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Build the complete resume from selections
    const selectedExpData = experiences.filter((exp) =>
      selection.selectedExperiences.includes(exp.id)
    );
    const selectedEduData = education.filter((edu) =>
      selection.selectedEducation.includes(edu.id)
    );
    const selectedProjData = projects.filter((proj) =>
      selection.selectedProjects.includes(proj.id)
    );
    const selectedSkillsData = skillCategories.filter((cat) =>
      selection.selectedSkillCategories.includes(cat.id)
    );

    console.log("Selected data counts:", {
      experiences: selectedExpData.length,
      education: selectedEduData.length,
      projects: selectedProjData.length,
      skills: selectedSkillsData.length,
    });

    // Build experiences with ORIGINAL bullets (not tailored)
    const finalExperiences = selectedExpData.map((exp) => ({
      company: exp.company,
      role: exp.role,
      location: exp.location || "",
      start: exp.start_date,
      end: exp.end_date || "Present",
      bullets: exp.bullets, // Use original bullets
    }));

    const finalProjects = selectedProjData.map((proj) => ({
      name: proj.name,
      link: proj.link || "",
      bullets: proj.bullets, // Use original bullets
    }));

    const finalEducation = selectedEduData.map((edu) => ({
      institution: edu.institution,
      degree: edu.degree,
      location: edu.location || "",
      start: edu.start_date || "",
      end: edu.end_date || "",
    }));

    const finalSkills = selectedSkillsData.map((cat) => ({
      name: cat.name,
      skills: cat.skills,
    }));

    // Build complete resume JSON
    const curatedResume = {
      version: "1.0",
      basics: {
        name: profile?.full_name || "",
        title: "", // User can fill this in
        location: profile?.location || "",
        contact: {
          email: profile?.email || "",
          phone: profile?.phone || "",
          // Convert profile links (string[]) to resume links format
          links: (profile?.links || []).map((url: string) => ({ url, displayName: "" })),
        },
        summary: "",
      },
      experience: finalExperiences,
      education: finalEducation,
      skills: finalSkills,
      projects: finalProjects,
    };

    // Generate inline suggestions from tailored content
    const inlineSuggestions: any[] = [];

    // Experience bullet suggestions
    selectedExpData.forEach((exp, expIndex) => {
      const tailored = selection.tailoredContent?.experiences?.[exp.id];
      if (tailored?.bullets) {
        tailored.bullets.forEach((suggestedBullet: string, bulletIndex: number) => {
          const originalBullet = exp.bullets[bulletIndex];
          if (originalBullet !== suggestedBullet) {
            inlineSuggestions.push({
              id: `exp-${expIndex}-bullet-${bulletIndex}-${Date.now()}`,
              type: "modify",
              section: "experience",
              sectionIndex: expIndex,
              field: "bullets",
              bulletIndex: bulletIndex,
              originalText: originalBullet,
              suggestedText: suggestedBullet,
              title: `Improve bullet point`,
              description: `AI-optimized for job relevance`,
              reasoning: "Tailored to highlight job-relevant achievements and keywords",
              status: "pending",
              highlightColor: "blue",
            });
          }
        });
      }
    });

    // Project bullet suggestions
    selectedProjData.forEach((proj, projIndex) => {
      const tailored = selection.tailoredContent?.projects?.[proj.id];
      if (tailored?.bullets) {
        tailored.bullets.forEach((suggestedBullet: string, bulletIndex: number) => {
          const originalBullet = proj.bullets[bulletIndex];
          if (originalBullet !== suggestedBullet) {
            inlineSuggestions.push({
              id: `proj-${projIndex}-bullet-${bulletIndex}-${Date.now()}`,
              type: "modify",
              section: "project",
              sectionIndex: projIndex,
              field: "bullets",
              bulletIndex: bulletIndex,
              originalText: originalBullet,
              suggestedText: suggestedBullet,
              title: `Improve project bullet`,
              description: `AI-optimized for job relevance`,
              reasoning: "Tailored to emphasize relevant technical skills and impact",
              status: "pending",
              highlightColor: "purple",
            });
          }
        });
      }
    });

    return NextResponse.json({
      resume: curatedResume,
      selections: {
        experiences: selection.selectedExperiences,
        education: selection.selectedEducation,
        projects: selection.selectedProjects,
        skillCategories: selection.selectedSkillCategories,
      },
      reasoning: selection.reasoning,
      inlineSuggestions: inlineSuggestions,
      provider, // Include which provider was used
    });
  } catch (error) {
    console.error("Error building curated resume:", error);
    return NextResponse.json(
      { error: "Failed to build curated resume" },
      { status: 500 }
    );
  }
}
