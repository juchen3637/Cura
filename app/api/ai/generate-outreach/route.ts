import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  complete,
  getActiveProvider,
  isProviderConfigured,
  AIProvider,
} from "@/lib/aiProvider";

export const runtime = "edge";

interface OutreachRequest {
  jobDescription: string;
  resumeData: any;
  recipientResearch?: string | null;
  recipientName?: string | null;
  recipientInfo?: {
    name?: string;
    title?: string;
    company?: string;
  };
  additionalNotes?: string;
  messageType: "linkedin" | "email" | "other";
  provider?: AIProvider;
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const {
      jobDescription,
      resumeData,
      recipientResearch,
      recipientName,
      recipientInfo,
      additionalNotes,
      messageType,
      provider: requestedProvider,
    } = (await req.json()) as OutreachRequest;

    if (!jobDescription || !resumeData) {
      return NextResponse.json(
        { error: "Job description and resume are required" },
        { status: 400 }
      );
    }

    // Determine which provider to use (default providers, not OpenAI for generation)
    const provider: AIProvider = requestedProvider || getActiveProvider();

    if (!isProviderConfigured(provider)) {
      const envVar = provider === "anthropic" ? "ANTHROPIC_API_KEY" : "GOOGLE_AI_API_KEY";
      return NextResponse.json(
        { error: `AI provider "${provider}" is not configured. Please set ${envVar}.` },
        { status: 503 }
      );
    }

    // Extract relevant resume information
    const resumeSummary = buildResumeSummary(resumeData);

    // Build recipient context
    const recipientContext = buildRecipientContext(recipientResearch, recipientName, recipientInfo);

    // Generate the appropriate message
    let prompt: string;

    if (messageType === "linkedin") {
      prompt = buildLinkedInPrompt(jobDescription, resumeSummary, recipientContext, additionalNotes);
    } else if (messageType === "email") {
      prompt = buildEmailPrompt(jobDescription, resumeSummary, recipientContext, additionalNotes);
    } else {
      prompt = buildOtherPrompt(jobDescription, resumeSummary, recipientContext, additionalNotes);
    }

    const responseText = await complete(prompt, {
      provider,
      maxTokens: messageType === "linkedin" ? 500 : messageType === "email" ? 2000 : 1500,
    });

    // Parse the response
    const result = parseOutreachResponse(responseText, messageType);

    return NextResponse.json({
      message: result.message,
      subject: result.subject,
      messageType,
      provider,
    });
  } catch (error) {
    console.error("Error generating outreach:", error);
    return NextResponse.json(
      { error: "Failed to generate outreach message" },
      { status: 500 }
    );
  }
}

function buildResumeSummary(resumeData: any): string {
  const parts: string[] = [];

  if (resumeData.basics?.name) {
    parts.push(`Name: ${resumeData.basics.name}`);
  }
  if (resumeData.basics?.title) {
    parts.push(`Current Title: ${resumeData.basics.title}`);
  }
  if (resumeData.basics?.summary) {
    parts.push(`Summary: ${resumeData.basics.summary}`);
  }

  if (resumeData.experience?.length > 0) {
    parts.push("\nRecent Experience:");
    resumeData.experience.slice(0, 3).forEach((exp: any) => {
      parts.push(`- ${exp.role} at ${exp.company}`);
      if (exp.bullets?.length > 0) {
        exp.bullets.slice(0, 2).forEach((bullet: string) => {
          parts.push(`  • ${bullet}`);
        });
      }
    });
  }

  if (resumeData.skills?.length > 0) {
    const skillsList = resumeData.skills
      .flatMap((cat: any) => cat.skills || [])
      .slice(0, 15)
      .join(", ");
    parts.push(`\nKey Skills: ${skillsList}`);
  }

  if (resumeData.projects?.length > 0) {
    parts.push("\nNotable Projects:");
    resumeData.projects.slice(0, 2).forEach((proj: any) => {
      parts.push(`- ${proj.name}`);
      if (proj.bullets?.[0]) {
        parts.push(`  ${proj.bullets[0]}`);
      }
    });
  }

  return parts.join("\n");
}

function buildRecipientContext(
  research: string | null | undefined,
  name: string | null | undefined,
  info?: { name?: string; title?: string; company?: string }
): string {
  const parts: string[] = [];

  const recipientName = name || info?.name;
  if (recipientName) {
    parts.push(`Recipient Name: ${recipientName}`);
  }
  if (info?.title) {
    parts.push(`Recipient Title: ${info.title}`);
  }
  if (info?.company) {
    parts.push(`Recipient Company: ${info.company}`);
  }

  if (research) {
    parts.push(`\nResearch on recipient:\n${research}`);
  }

  if (parts.length === 0) {
    return "No specific recipient information available. Write a general but personable message.";
  }

  return parts.join("\n");
}

function buildLinkedInPrompt(
  jobDescription: string,
  resumeSummary: string,
  recipientContext: string,
  additionalNotes?: string
): string {
  const specialInstructions = additionalNotes?.trim()
    ? `\n\nSPECIAL INSTRUCTIONS (MUST FOLLOW):\n${additionalNotes}\n`
    : '';

  const instructionItem = additionalNotes?.trim()
    ? '6. CRITICALLY: Strictly adheres to the special instructions above\n'
    : '';

  return `You are an expert at writing professional LinkedIn connection messages for job seekers.

CANDIDATE'S RESUME:
${resumeSummary}

JOB DESCRIPTION:
${jobDescription}

RECIPIENT INFORMATION:
${recipientContext}${specialInstructions}
Write a LinkedIn connection request message that:
1. Is warm and professional, not salesy or desperate
2. References something specific about the recipient if info is available
3. Briefly mentions why the candidate would be a great fit
4. Includes a soft call to action (e.g., "Would love to connect" or "Happy to chat")
5. Feels genuine and personalized, not templated
${instructionItem}
CRITICAL: The message MUST be under 300 characters (LinkedIn's limit for connection requests).

Return ONLY the message text, nothing else. No quotes, no explanation.`;
}

function buildEmailPrompt(
  jobDescription: string,
  resumeSummary: string,
  recipientContext: string,
  additionalNotes?: string
): string {
  const specialInstructions = additionalNotes?.trim()
    ? `\n\nSPECIAL INSTRUCTIONS (MUST FOLLOW):\n${additionalNotes}\n`
    : '';

  const instructionItem = additionalNotes?.trim()
    ? '8. CRITICALLY: Strictly adheres to the special instructions above\n'
    : '';

  return `You are an expert at writing professional outreach emails for job seekers.

CANDIDATE'S RESUME:
${resumeSummary}

JOB DESCRIPTION:
${jobDescription}

RECIPIENT INFORMATION:
${recipientContext}${specialInstructions}
Write a professional outreach email that:
1. Has a compelling subject line
2. Opens with a personalized reference to the recipient if info is available
3. Clearly states interest in the role/opportunity
4. Highlights 2-3 specific qualifications from the resume that match the job
5. Demonstrates knowledge of the company/role
6. Ends with a clear but polite call to action
7. Is concise (under 300 words for the body)
${instructionItem}
Return the email in this exact format:
SUBJECT: [subject line here]
---
[email body here]

Do not include any other text or explanation.`;
}

function buildOtherPrompt(
  jobDescription: string,
  resumeSummary: string,
  recipientContext: string,
  additionalNotes?: string
): string {
  const specialInstructions = additionalNotes?.trim()
    ? `\n\nSPECIAL INSTRUCTIONS (MUST FOLLOW):\n${additionalNotes}\n`
    : '';

  const instructionGuideline = additionalNotes?.trim()
    ? '1. Use the special instructions as your PRIMARY directive for tone, format, style, and content\n2. Personalize based on the recipient information if available\n3. Highlight relevant qualifications from the resume that match the job\n4. Keep the message professional and concise\n5. CRITICALLY: The special instructions take precedence over these general guidelines\n\nThe format, length, and style should match exactly what is specified in the special instructions.'
    : '1. Write a professional, personalized outreach message\n2. Personalize based on the recipient information if available\n3. Highlight relevant qualifications from the resume that match the job\n4. Keep the message concise and professional (aim for 200-300 words)\n5. End with a clear call to action';

  return `You are an expert at writing professional outreach messages for job seekers.

CANDIDATE'S RESUME:
${resumeSummary}

JOB DESCRIPTION:
${jobDescription}

RECIPIENT INFORMATION:
${recipientContext}${specialInstructions}
Write a professional outreach message following these guidelines:
${instructionGuideline}

Return ONLY the message text as specified. Do not add quotes, explanations, or any other text.`;
}

function parseOutreachResponse(
  response: string,
  messageType: "linkedin" | "email" | "other"
): { message: string; subject?: string } {
  if (messageType === "linkedin" || messageType === "other") {
    // For LinkedIn and Other, just clean up the response
    const message = response.trim().replace(/^["']|["']$/g, "");
    return { message };
  }

  // For email, parse subject and body
  const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|---)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : "Regarding the open position";

  // Get the body after the separator
  const bodyMatch = response.split(/---+/);
  const body = bodyMatch.length > 1
    ? bodyMatch.slice(1).join("---").trim()
    : response.replace(/SUBJECT:.+/i, "").trim();

  return {
    message: body,
    subject,
  };
}
