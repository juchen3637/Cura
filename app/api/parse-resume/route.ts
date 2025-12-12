import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "edge";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { pdfData, mediaType } = await req.json();

    if (!pdfData) {
      return NextResponse.json(
        { error: "PDF data is required" },
        { status: 400 }
      );
    }

    // Build the message content with PDF document
    const messageContent = [
      {
        type: "document" as const,
        source: {
          type: "base64" as const,
          media_type: (mediaType || "application/pdf") as "application/pdf",
          data: pdfData,
        },
      },
      {
        type: "text" as const,
        text: `You are a resume parsing expert. Please analyze the uploaded resume PDF and extract all information into a structured JSON format.

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
- Return ONLY the JSON object, no additional text or explanation`,
      },
    ];

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: messageContent as any, // Document type not in SDK types yet
        },
      ],
    });

    const responseText = message.content[0].type === "text"
      ? message.content[0].text
      : "";

    // Parse the JSON response from Claude
    let resumeData;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      resumeData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", parseError);
      console.error("Raw response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse resume data from PDF" },
        { status: 500 }
      );
    }

    // Post-process: Clean up any remaining line breaks in bullets
    const cleanBullets = (bullets: string[]) => {
      return bullets.map(bullet =>
        bullet
          .replace(/\n/g, ' ')  // Replace newlines with spaces
          .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
          .trim()                 // Remove leading/trailing spaces
      );
    };

    // Clean experience bullets
    if (resumeData.experience && Array.isArray(resumeData.experience)) {
      resumeData.experience = resumeData.experience.map((exp: any) => ({
        ...exp,
        bullets: exp.bullets ? cleanBullets(exp.bullets) : []
      }));
    }

    // Clean project bullets
    if (resumeData.projects && Array.isArray(resumeData.projects)) {
      resumeData.projects = resumeData.projects.map((proj: any) => ({
        ...proj,
        bullets: proj.bullets ? cleanBullets(proj.bullets) : []
      }));
    }

    return NextResponse.json(resumeData);
  } catch (error) {
    console.error("Error parsing resume:", error);
    return NextResponse.json(
      { error: "Failed to parse resume PDF" },
      { status: 500 }
    );
  }
}
