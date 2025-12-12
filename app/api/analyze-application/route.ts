import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "edge";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { resume, coverLetter, jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (!resume) {
      return NextResponse.json(
        { error: "Resume is required" },
        { status: 400 }
      );
    }

    // Build the message content
    const messageContent: Array<any> = [];

    // Add resume - either as PDF document or as text content
    if (resume.base64Data) {
      // PDF format
      messageContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: resume.mediaType,
          data: resume.base64Data,
        },
      });
    }

    // Parse resume content if it's JSON to get skill categories
    let skillCategories: any[] = [];
    if (!resume.base64Data && resume.content) {
      try {
        const resumeData = JSON.parse(resume.content);
        skillCategories = resumeData.skills || [];
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Build the analysis prompt
    let prompt = `You are an expert career counselor and resume consultant.

${resume.base64Data ? "I have uploaded a resume PDF." : "I have provided resume content."}
${!resume.base64Data && resume.content ? `\n\nRESUME CONTENT:\n${resume.content}\n` : ""}

${skillCategories.length > 0 ? `\nCURRENT SKILL CATEGORIES:\n${skillCategories.map((cat, idx) => `${idx}. ${cat.name}: ${cat.skills.join(", ")}`).join("\n")}\n` : ""}

JOB DESCRIPTION:
${jobDescription}

Please analyze the resume against this job description and provide SPECIFIC, ACTIONABLE text changes.

For each suggestion, you must provide:
1. The EXACT current text that should be changed (word-for-word from the resume)
2. The EXACT suggested replacement text
3. The section/location where this change should be made
4. A brief reason for the change

Focus on:
- Bullet points that could be more impactful or relevant
- Missing keywords for ATS optimization
- Metrics that could be added or improved
- Skills or experiences that should be emphasized differently

Format your response as JSON with this EXACT structure:
{
  "overallFit": "2-3 sentence assessment",
  "keyRequirements": ["requirement 1", "requirement 2", ...],
  "changes": [
    {
      "section": "experience" | "project" | "summary" | "skills",
      "sectionIndex": 0,
      "field": "bullets" | "summary" | "role" | "skills",
      "bulletIndex": 0,
      "currentText": "exact current text from resume",
      "suggestedText": "exact suggested replacement",
      "categoryName": "only for skills - which category (e.g., 'Developer Tools', 'Frameworks')",
      "reason": "why this change improves the resume"
    }
  ]
}

CRITICAL INSTRUCTIONS:
- For currentText, use the EXACT text from the resume word-for-word
- For bullet points, provide the complete bullet text
- For SKILLS changes:
  * Use sectionIndex to indicate which skill category (0, 1, 2, etc. from the list above)
  * Use bulletIndex to indicate which skill in that category's array
  * For REPLACING a skill: provide exact currentText matching the skill name
  * For ADDING a new skill: use currentText="" and provide the new skill in suggestedText
  * IMPORTANT: Match the skill to the most appropriate existing category. For example:
    - Programming languages → "Languages" or "Programming Languages" category
    - Frameworks/libraries → "Frameworks" or "Frameworks and Libraries" category
    - Tools/platforms → "Developer Tools" or "Tools" category
  * If suggesting "Microsoft 365", "Power Platform", etc., add them to the Tools/Developer Tools category
- Return 5-10 specific text changes with exact before/after text.`;

    // Add the text prompt
    messageContent.push({
      type: "text",
      text: prompt,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    const responseText = message.content[0].type === "text"
      ? message.content[0].text
      : "";

    // Parse the JSON response from Claude
    let analysis;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Ensure all expected fields exist
    const result = {
      overallFit: analysis.overallFit || "",
      keyRequirements: analysis.keyRequirements || [],
      changes: analysis.changes || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing application:", error);
    return NextResponse.json(
      { error: "Failed to analyze application" },
      { status: 500 }
    );
  }
}
