import { NextResponse } from "next/server";
import {
  completeWithDocument,
  complete,
  getActiveProvider,
  isProviderConfigured,
  parseJSONResponse,
  AIProvider,
} from "@/lib/aiProvider";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { resume, coverLetter, jobDescription, provider: requestedProvider } = await req.json();

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

    // Determine which provider to use
    const provider: AIProvider = requestedProvider || getActiveProvider();

    if (!isProviderConfigured(provider)) {
      const envVar = provider === "anthropic" ? "ANTHROPIC_API_KEY" : "GOOGLE_AI_API_KEY";
      return NextResponse.json(
        { error: `AI provider "${provider}" is not configured. Please set ${envVar}.` },
        { status: 503 }
      );
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
    const prompt = `You are an expert career counselor, resume consultant, and ATS optimization specialist.

${resume.base64Data ? "I have uploaded a resume PDF." : "I have provided resume content."}
${!resume.base64Data && resume.content ? `\n\nRESUME CONTENT:\n${resume.content}\n` : ""}

${skillCategories.length > 0 ? `\nCURRENT SKILL CATEGORIES:\n${skillCategories.map((cat, idx) => `${idx}. ${cat.name}: ${cat.skills.join(", ")}`).join("\n")}\n` : ""}

JOB DESCRIPTION:
${jobDescription}

Please perform a comprehensive analysis of the resume against this job description.

## STEP 1: KEYWORD EXTRACTION
First, extract all important keywords from the job description including:
- Technical skills, tools, and technologies
- Soft skills and competencies
- Industry-specific terminology
- Required qualifications and certifications
- Action verbs and power words used

## STEP 2: KEYWORD MATCHING
Compare the extracted keywords against the resume and identify:
- Keywords that ARE present in the resume (matched)
- Keywords that are MISSING from the resume (missing)
- Calculate an overall match percentage

## STEP 3: ACTIONABLE IMPROVEMENTS
For each suggestion, focus on:
1. INCORPORATING MISSING KEYWORDS naturally into existing bullet points
2. Making bullet points more impactful, measurable, and action-oriented
3. Adding metrics and quantifiable achievements where possible
4. Optimizing for ATS parsing and keyword matching

Format your response as JSON with this EXACT structure:
{
  "matchScore": 75,
  "overallFit": "2-3 sentence assessment of how well the resume matches the job",
  "keywordAnalysis": {
    "matched": ["keyword1", "keyword2", "..."],
    "missing": ["keyword3", "keyword4", "..."],
    "totalJobKeywords": 25,
    "matchedCount": 18
  },
  "keyRequirements": ["requirement 1", "requirement 2", "..."],
  "changes": [
    {
      "section": "experience" | "project" | "summary" | "skills",
      "sectionIndex": 0,
      "field": "bullets" | "summary" | "role" | "skills",
      "bulletIndex": 0,
      "currentText": "exact current text from resume",
      "suggestedText": "improved text with keywords incorporated",
      "categoryName": "only for skills - which category",
      "keywordsAdded": ["keyword1", "keyword2"],
      "reason": "why this change improves the resume and which keywords it adds"
    }
  ]
}

CRITICAL INSTRUCTIONS:
- matchScore should be a number 0-100 representing overall resume-job fit
- For currentText, use the EXACT text from the resume word-for-word
- For bullet points, provide the complete bullet text
- In suggestedText, NATURALLY incorporate missing keywords - don't just add them awkwardly
- Focus on making suggestions that add the most high-value missing keywords
- For SKILLS changes:
  * Use sectionIndex to indicate which skill category (0, 1, 2, etc.)
  * Use bulletIndex to indicate which skill in that category's array
  * For ADDING a new skill: use currentText="" and provide the new skill in suggestedText
  * Match skills to the most appropriate existing category
- Return 8-12 specific text changes, prioritizing those that incorporate the most important missing keywords
- Each change should add at least 1-2 relevant keywords while improving readability`;

    let responseText: string;

    // If resume has PDF data, use document completion
    if (resume.base64Data) {
      const result = await completeWithDocument(
        prompt,
        { data: resume.base64Data, mediaType: resume.mediaType },
        { provider, maxTokens: 4000 }
      );
      responseText = result.text;
    } else {
      // Text-only completion
      responseText = await complete(prompt, {
        provider,
        maxTokens: 4000,
      });
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = parseJSONResponse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Ensure all expected fields exist
    const result = {
      matchScore: analysis.matchScore || 0,
      overallFit: analysis.overallFit || "",
      keywordAnalysis: analysis.keywordAnalysis || {
        matched: [],
        missing: [],
        totalJobKeywords: 0,
        matchedCount: 0,
      },
      keyRequirements: analysis.keyRequirements || [],
      changes: analysis.changes || [],
      provider, // Include which provider was used
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
