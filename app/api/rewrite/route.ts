import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropicClient";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid request: text is required" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { 
          error: "API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file and restart the server.",
          needsConfig: true 
        },
        { status: 503 }
      );
    }

    const client = getAnthropicClient();

    const prompt = `Rewrite this resume bullet to be concise, measurable, and action-oriented.
Avoid buzzwords and vague phrasing.
Return 2–3 improved bullet points.

Original: "${text}"`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content[0];
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Invalid response from AI" },
        { status: 500 }
      );
    }

    const suggestions = textBlock.text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.match(/^(Here are|Original:)/i));

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error("AI rewrite error:", err);
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch suggestions";
    
    if (err.message?.includes("ANTHROPIC_API_KEY")) {
      errorMessage = "API key not configured. Add ANTHROPIC_API_KEY to .env.local and restart.";
    } else if (err.status === 401) {
      errorMessage = "Invalid API key. Please check your ANTHROPIC_API_KEY.";
    } else if (err.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again in a moment.";
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

