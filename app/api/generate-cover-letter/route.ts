import { NextRequest, NextResponse } from "next/server";
import {
  complete,
  getActiveProvider,
  isProviderConfigured,
  AIProvider,
} from "@/lib/aiProvider";
import { Resume } from "@/types/resume";

export const runtime = "edge";

interface CoverLetterRequest {
  resume: Resume;
  coverLetterData: {
    recipientName?: string;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    additionalInfo?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { resume, coverLetterData }: CoverLetterRequest = await req.json();

    if (!resume || !coverLetterData) {
      return NextResponse.json(
        { error: "Invalid request: resume and cover letter data are required" },
        { status: 400 }
      );
    }

    // Determine which provider to use
    const provider: AIProvider = getActiveProvider();

    // Check if the provider is configured
    if (!isProviderConfigured(provider)) {
      const envVar = provider === "anthropic" ? "ANTHROPIC_API_KEY" : "GOOGLE_AI_API_KEY";
      return NextResponse.json(
        {
          error: `AI provider "${provider}" is not configured. Please add ${envVar} to your .env.local file and restart the server.`,
          needsConfig: true,
        },
        { status: 503 }
      );
    }

    // Build the prompt
    const resumeText = formatResumeForPrompt(resume);
    const recipient = coverLetterData.recipientName || "Hiring Manager";

    const prompt = `You are a professional career advisor helping to write a compelling cover letter.

Based on the following resume and job details, write a professional, engaging 1-page cover letter.

RESUME:
${resumeText}

JOB DETAILS:
Company: ${coverLetterData.companyName}
Position: ${coverLetterData.jobTitle}
Job Description: ${coverLetterData.jobDescription}
${coverLetterData.additionalInfo ? `Additional Information: ${coverLetterData.additionalInfo}` : ""}

INSTRUCTIONS:
1. Write a professional cover letter that:
   - Opens with a strong introduction expressing interest in the position
   - Highlights 2-3 relevant experiences or skills from the resume that match the job requirements
   - Demonstrates knowledge of the company (if the job description provides context)
   - Shows enthusiasm and cultural fit
   - Closes with a call to action
2. Keep it to approximately 3-4 paragraphs
3. Use professional but personable tone
4. Focus on achievements and impact, not just responsibilities
5. Make it specific to this role and company
6. Ensure it fits on one page when printed

Format the letter as follows:

[Your Name]
[Your Email] | [Your Phone]
[Today's Date]

Dear ${recipient},

[Opening paragraph]

[Body paragraph(s) - 1-2 paragraphs]

[Closing paragraph]

Sincerely,
[Your Name]`;

    const coverLetter = await complete(prompt, {
      provider,
      maxTokens: 1200,
    });

    // Replace placeholder name and contact info with actual data
    const personalizedCoverLetter = coverLetter
      .replace(/\[Your Name\]/g, resume.basics.name || "[Your Name]")
      .replace(/\[Your Email\]/g, resume.basics.contact.email || "[Your Email]")
      .replace(/\[Your Phone\]/g, resume.basics.contact.phone || "[Your Phone]")
      .replace(/\[Today's Date\]/g, new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }));

    return NextResponse.json({
      coverLetter: personalizedCoverLetter,
      provider,
    });
  } catch (err: any) {
    console.error("Cover letter generation error:", err);

    let errorMessage = "Failed to generate cover letter";

    if (err.message?.includes("API_KEY")) {
      errorMessage = "API key not configured. Check your environment variables.";
    } else if (err.status === 401) {
      errorMessage = "Invalid API key. Please check your configuration.";
    } else if (err.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again in a moment.";
    } else if (err.message) {
      errorMessage = err.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function formatResumeForPrompt(resume: Resume): string {
  let text = `Name: ${resume.basics.name}\n`;
  text += `Title: ${resume.basics.title}\n`;
  text += `Email: ${resume.basics.contact.email}\n`;
  text += `Phone: ${resume.basics.contact.phone}\n`;

  if (resume.basics.summary) {
    text += `\nSummary:\n${resume.basics.summary}\n`;
  }

  if (resume.experience && resume.experience.length > 0) {
    text += `\nExperience:\n`;
    resume.experience.forEach((exp) => {
      text += `\n${exp.role} at ${exp.company} (${exp.start} - ${exp.end})\n`;
      exp.bullets.forEach((bullet) => {
        text += `- ${bullet}\n`;
      });
    });
  }

  if (resume.projects && resume.projects.length > 0) {
    text += `\nProjects:\n`;
    resume.projects.forEach((proj) => {
      text += `\n${proj.name}\n`;
      proj.bullets.forEach((bullet) => {
        text += `- ${bullet}\n`;
      });
    });
  }

  if (resume.education && resume.education.length > 0) {
    text += `\nEducation:\n`;
    resume.education.forEach((edu) => {
      text += `${edu.degree} from ${edu.institution} (${edu.end})\n`;
    });
  }

  if (resume.skills && resume.skills.length > 0) {
    text += `\nSkills:\n`;
    resume.skills.forEach((category) => {
      text += `${category.name}: ${category.skills.join(", ")}\n`;
    });
  }

  return text;
}
