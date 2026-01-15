import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOpenAIConfigured, getOpenAIClient } from "@/lib/aiProvider";

export const runtime = "edge";

interface RecipientInfo {
  name?: string;
  title?: string;
  company?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  additionalNotes?: string;
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

    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: "OpenAI is not configured. Please set OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    const { recipientInfo } = await req.json() as { recipientInfo: RecipientInfo };

    // If no meaningful recipient info provided, return empty research
    if (!recipientInfo.name && !recipientInfo.linkedinUrl && !recipientInfo.twitterUrl && !recipientInfo.githubUrl) {
      return NextResponse.json({
        research: null,
        message: "No recipient information provided for research",
      });
    }

    // Build search query from recipient info
    const searchParts: string[] = [];
    if (recipientInfo.name) searchParts.push(recipientInfo.name);
    if (recipientInfo.title) searchParts.push(recipientInfo.title);
    if (recipientInfo.company) searchParts.push(recipientInfo.company);

    const socialLinks: string[] = [];
    if (recipientInfo.linkedinUrl) socialLinks.push(`LinkedIn: ${recipientInfo.linkedinUrl}`);
    if (recipientInfo.twitterUrl) socialLinks.push(`Twitter/X: ${recipientInfo.twitterUrl}`);
    if (recipientInfo.githubUrl) socialLinks.push(`GitHub: ${recipientInfo.githubUrl}`);
    if (recipientInfo.websiteUrl) socialLinks.push(`Website: ${recipientInfo.websiteUrl}`);

    const searchContext = `
Person to research:
${searchParts.length > 0 ? `Name/Title/Company: ${searchParts.join(", ")}` : ""}
${socialLinks.length > 0 ? `Social profiles:\n${socialLinks.join("\n")}` : ""}
${recipientInfo.additionalNotes ? `Additional context: ${recipientInfo.additionalNotes}` : ""}
`.trim();

    const client = getOpenAIClient();

    // Use OpenAI's Responses API with web_search tool
    const response = await client.responses.create({
      model: "gpt-4o",
      tools: [{ type: "web_search" }],
      input: `You are a professional research assistant helping with job outreach. Research the following person to help craft a personalized outreach message.

${searchContext}

Find and summarize:
1. Their current role and responsibilities
2. Their professional background and career history
3. Any recent news, blog posts, or public content they've shared
4. Their areas of expertise or interests
5. Any notable achievements or projects
6. Company information if relevant

Provide a concise summary that would help personalize a job application outreach message. Focus on professional details that could be referenced in a connection request or email.

If you cannot find information about this person, say so clearly.`,
    });

    // Extract the text response
    let researchText = "";
    if (response.output) {
      for (const item of response.output) {
        if (item.type === "message" && item.content) {
          for (const content of item.content) {
            if (content.type === "output_text") {
              researchText += content.text;
            }
          }
        }
      }
    }

    return NextResponse.json({
      research: researchText || null,
      recipientName: recipientInfo.name || null,
    });
  } catch (error) {
    console.error("Error in outreach search:", error);
    return NextResponse.json(
      { error: "Failed to research recipient" },
      { status: 500 }
    );
  }
}
