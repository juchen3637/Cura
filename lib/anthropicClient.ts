import { Anthropic } from "@anthropic-ai/sdk";

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set. Please add it to your .env.local file.");
  }

  return new Anthropic({
    apiKey: apiKey,
  });
}

export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// Optional type export for edge safety
export type AnthropicClient = ReturnType<typeof getAnthropicClient>;

