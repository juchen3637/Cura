import { NextResponse } from "next/server";
import {
  completeWithDocument,
  getActiveProvider,
  isProviderConfigured,
  parseJSONResponse,
  AIProvider,
} from "@/lib/aiProvider";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { pdfData, mediaType, provider: requestedProvider } = await req.json();

    if (!pdfData) {
      return NextResponse.json(
        { error: "PDF data is required" },
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

    const prompt = `You are a resume parsing expert. Please analyze the uploaded resume PDF and extract all information into a structured JSON format.

Extract the following information:

1. **Basics**:
   - name (full name)
   - title (professional title/headline)
   - location (city, state/country)
   - contact (email, phone, links like LinkedIn, GitHub, portfolio)
   - summary (professional summary or objective)

2. **Experience** (array of work experiences):
   - company (company name)
   - role (job title)
   - location (job location)
   - start (format as "YYYY-MM", or just "YYYY" if month not available)
   - end (format as "YYYY-MM" or "Present")
   - bullets (array of achievement/responsibility bullets)

3. **Education** (array):
   - institution (school/university name)
   - degree (e.g., "Bachelor of Science in Computer Science")
   - location (school location)
   - start (format as "YYYY-MM" or "YYYY")
   - end (format as "YYYY-MM" or "YYYY" - graduation year/date)

4. **Projects** (array):
   - name (project name)
   - link (project URL if available, otherwise empty string)
   - bullets (array of bullet points describing the project)

5. **Skills** (array of skill categories):
   - name (category name like "Languages", "Frameworks", "Tools")
   - skills (array of skill names)

Return ONLY valid JSON in this exact structure:
{
  "version": "1.0",
  "basics": {
    "name": "",
    "title": "",
    "location": "",
    "contact": {
      "email": "",
      "phone": "",
      "links": []
    },
    "summary": ""
  },
  "experience": [],
  "education": [],
  "skills": [],
  "projects": []
}

Important guidelines:
- If a field is not found in the resume, use an empty string "" or empty array []
- For dates, try to extract the most accurate format (prefer "YYYY-MM" over just "YYYY")
- For skills, if they're listed as a comma-separated list, try to intelligently categorize them
- **CRITICAL: Remove all hard line breaks within bullet points** - Each bullet should be a single continuous string of text, even if it wrapped across multiple lines in the PDF
- Join text that was split across lines in the PDF into single sentences
- Remove any mid-sentence line breaks or hyphenation
- Each bullet point should be one complete sentence or phrase without internal line breaks
- Do not add information that is not in the resume
- Return ONLY the JSON object, no additional text or explanation`;

    const result = await completeWithDocument(
      prompt,
      { data: pdfData, mediaType: mediaType || "application/pdf" },
      { provider, maxTokens: 4000 }
    );

    // Parse the JSON response
    let resumeData;
    try {
      resumeData = parseJSONResponse(result.text);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", result.text);
      return NextResponse.json(
        { error: "Failed to parse resume data from PDF" },
        { status: 500 }
      );
    }

    // Post-process: Clean up any remaining line breaks in bullets
    const cleanBullets = (bullets: string[]) => {
      return bullets.map((bullet) =>
        bullet
          .replace(/\n/g, " ") // Replace newlines with spaces
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .trim() // Remove leading/trailing spaces
      );
    };

    // Clean experience bullets
    if (resumeData.experience && Array.isArray(resumeData.experience)) {
      resumeData.experience = resumeData.experience.map((exp: any) => ({
        ...exp,
        bullets: exp.bullets ? cleanBullets(exp.bullets) : [],
      }));
    }

    // Clean project bullets
    if (resumeData.projects && Array.isArray(resumeData.projects)) {
      resumeData.projects = resumeData.projects.map((proj: any) => ({
        ...proj,
        bullets: proj.bullets ? cleanBullets(proj.bullets) : [],
      }));
    }

    // Convert links to new format (AI may return string[] or ResumeLink[])
    if (resumeData.basics?.contact?.links && Array.isArray(resumeData.basics.contact.links)) {
      resumeData.basics.contact.links = resumeData.basics.contact.links.map((link: any) => {
        // If it's already in the new format, keep it
        if (typeof link === 'object' && 'url' in link) {
          return { url: link.url || '', displayName: link.displayName || '' };
        }
        // If it's a string, convert to new format
        return { url: String(link), displayName: '' };
      });
    }

    return NextResponse.json({
      ...resumeData,
      _meta: { provider: result.provider, model: result.model },
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    return NextResponse.json(
      { error: "Failed to parse resume PDF" },
      { status: 500 }
    );
  }
}
