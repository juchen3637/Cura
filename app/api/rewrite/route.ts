import { NextRequest, NextResponse } from "next/server";
import {
  complete,
  getActiveProvider,
  isProviderConfigured,
  parseJSONResponse,
  AIProvider,
} from "@/lib/aiProvider";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { text, provider: requestedProvider } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid request: text is required" },
        { status: 400 }
      );
    }

    // Determine which provider to use
    const provider: AIProvider = requestedProvider || getActiveProvider();

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

    const prompt = `Rewrite this resume bullet to be concise, measurable, and action-oriented.
Avoid buzzwords and vague phrasing.
Return 2–3 improved bullet points.

Original: "${text}"`;

    const responseText = await complete(prompt, {
      provider,
      maxTokens: 400,
    });

    const suggestions = responseText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.match(/^(Here are|Original:)/i));

    return NextResponse.json({
      suggestions,
      provider, // Include which provider was used
    });
  } catch (err: any) {
    console.error("AI rewrite error:", err);

    let errorMessage = "Failed to fetch suggestions";

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
