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
   Bullets (${exp.bullets.length} total):
   ${exp.bullets.map((b: string, bIdx: number) => `   [${bIdx}] • ${b}`).join("\n")}
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
   Bullets (${proj.bullets.length} total):
   ${proj.bullets.map((b: string, bIdx: number) => `   [${bIdx}] • ${b}`).join("\n")}
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
- For each selected experience, select the TOP ${preferences?.maxBulletsPerExperience || 3} most relevant bullet points (by index) that best match the job requirements
- Include all education entries unless clearly irrelevant
- Select ${preferences?.maxProjects || 2} most impressive/relevant projects
- For each selected project, select the TOP ${preferences?.maxBulletsPerProject || 3} most relevant bullet points (by index) that best match the job requirements
- Choose skill categories that match the job requirements

IMPORTANT: For each selected experience and project, you MUST specify which bullet indices to include using "selectedBulletIndices". Choose the bullets that best demonstrate relevant skills and achievements for the job.

For each selected bullet, you may tailor it to better highlight job-relevant achievements. Keep the core facts but emphasize relevant aspects.

Return a JSON response with this EXACT structure:
{
  "selectedExperiences": ["experience_id_1", "experience_id_2", ...],
  "selectedEducation": ["education_id_1", ...],
  "selectedProjects": ["project_id_1", "project_id_2"],
  "selectedSkillCategories": ["skill_category_id_1", ...],
  "tailoredContent": {
    "experiences": {
      "experience_id_1": {
        "selectedBulletIndices": [0, 2, 4],
        "bullets": ["tailored version of bullet 0", "tailored version of bullet 2", "tailored version of bullet 4"]
      }
    },
    "projects": {
      "project_id_1": {
        "selectedBulletIndices": [0, 1],
        "bullets": ["tailored version of bullet 0", "tailored version of bullet 1"]
      }
    }
  },
  "reasoning": "2-3 sentences explaining why these items were selected and how they match the job requirements"
}

NOTE: The "selectedBulletIndices" array contains the indices of the bullets you selected (from the [index] shown in the profile data). The "bullets" array should contain tailored versions of those selected bullets IN THE SAME ORDER as selectedBulletIndices.

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

    // Build experiences with SELECTED bullets (limited by preferences)
    const maxBulletsPerExperience = preferences?.maxBulletsPerExperience || 3;
    const maxBulletsPerProject = preferences?.maxBulletsPerProject || 3;

    const finalExperiences = selectedExpData.map((exp) => {
      const tailored = selection.tailoredContent?.experiences?.[exp.id];
      // Get selected bullet indices, fallback to first N bullets if not provided
      const selectedIndices = tailored?.selectedBulletIndices ||
        exp.bullets.slice(0, maxBulletsPerExperience).map((_: string, i: number) => i);
      // Get only the selected bullets (original versions)
      const selectedBullets = selectedIndices
        .slice(0, maxBulletsPerExperience)
        .map((idx: number) => exp.bullets[idx])
        .filter(Boolean);

      return {
        company: exp.company,
        role: exp.role,
        location: exp.location || "",
        start: exp.start_date,
        end: exp.end_date || "Present",
        bullets: selectedBullets,
      };
    });

    const finalProjects = selectedProjData.map((proj) => {
      const tailored = selection.tailoredContent?.projects?.[proj.id];
      // Get selected bullet indices, fallback to first N bullets if not provided
      const selectedIndices = tailored?.selectedBulletIndices ||
        proj.bullets.slice(0, maxBulletsPerProject).map((_: string, i: number) => i);
      // Get only the selected bullets (original versions)
      const selectedBullets = selectedIndices
        .slice(0, maxBulletsPerProject)
        .map((idx: number) => proj.bullets[idx])
        .filter(Boolean);

      return {
        name: proj.name,
        link: proj.link || "",
        bullets: selectedBullets,
      };
    });

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

    // Generate inline suggestions from tailored content (only for selected bullets)
    const inlineSuggestions: any[] = [];

    // Experience bullet suggestions
    selectedExpData.forEach((exp, expIndex) => {
      const tailored = selection.tailoredContent?.experiences?.[exp.id];
      if (tailored?.selectedBulletIndices && tailored?.bullets) {
        // Iterate over selected bullet indices
        tailored.selectedBulletIndices.forEach((originalIdx: number, newIdx: number) => {
          const originalBullet = exp.bullets[originalIdx];
          const suggestedBullet = tailored.bullets[newIdx];
          // Only create suggestion if both exist and are different
          if (originalBullet && suggestedBullet && originalBullet !== suggestedBullet) {
            inlineSuggestions.push({
              id: `exp-${expIndex}-bullet-${newIdx}-${Date.now()}`,
              type: "modify",
              section: "experience",
              sectionIndex: expIndex,
              field: "bullets",
              bulletIndex: newIdx, // Use new index (position in final resume)
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
      if (tailored?.selectedBulletIndices && tailored?.bullets) {
        // Iterate over selected bullet indices
        tailored.selectedBulletIndices.forEach((originalIdx: number, newIdx: number) => {
          const originalBullet = proj.bullets[originalIdx];
          const suggestedBullet = tailored.bullets[newIdx];
          // Only create suggestion if both exist and are different
          if (originalBullet && suggestedBullet && originalBullet !== suggestedBullet) {
            inlineSuggestions.push({
              id: `proj-${projIndex}-bullet-${newIdx}-${Date.now()}`,
              type: "modify",
              section: "project",
              sectionIndex: projIndex,
              field: "bullets",
              bulletIndex: newIdx, // Use new index (position in final resume)
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
