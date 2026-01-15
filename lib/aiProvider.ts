import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import OpenAI from "openai";

// ============================================================================
// Types
// ============================================================================

export type AIProvider = "anthropic" | "gemini" | "openai";

export interface AIMessage {
  role: "user" | "assistant";
  content: string | AIContentPart[];
}

export interface AIContentPart {
  type: "text" | "document" | "image";
  text?: string;
  // For documents/images
  source?: {
    type: "base64";
    mediaType: string;
    data: string;
  };
}

export interface AICompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AICompletionResult {
  text: string;
  provider: AIProvider;
  model: string;
}

// ============================================================================
// Configuration
// ============================================================================

export function getActiveProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === "gemini") return "gemini";
  if (provider === "openai") return "openai";
  return "anthropic"; // Default to Anthropic
}

export function isProviderConfigured(provider: AIProvider): boolean {
  if (provider === "anthropic") {
    return !!process.env.ANTHROPIC_API_KEY;
  }
  if (provider === "gemini") {
    return !!process.env.GOOGLE_AI_API_KEY;
  }
  if (provider === "openai") {
    return !!process.env.OPENAI_API_KEY;
  }
  return false;
}

export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (process.env.ANTHROPIC_API_KEY) providers.push("anthropic");
  if (process.env.GOOGLE_AI_API_KEY) providers.push("gemini");
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  return providers;
}

// Default models for each provider
const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: "claude-sonnet-4-5-20250929",
  gemini: "gemini-3-pro-preview",
  openai: "gpt-5.2-2025-12-11",
};

// ============================================================================
// Anthropic Client
// ============================================================================

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

async function createAnthropicCompletion(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  const client = getAnthropicClient();
  const model = options.model || DEFAULT_MODELS.anthropic;

  // Convert our message format to Anthropic's format
  const anthropicMessages = messages.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: convertToAnthropicContent(msg.content),
  }));

  const response = await client.messages.create({
    model,
    max_tokens: options.maxTokens || 4000,
    messages: anthropicMessages,
  });

  const textBlock = response.content[0];
  const text = textBlock?.type === "text" ? textBlock.text : "";

  return {
    text,
    provider: "anthropic",
    model,
  };
}

function convertToAnthropicContent(
  content: string | AIContentPart[]
): any {
  if (typeof content === "string") {
    return content;
  }

  return content.map((part) => {
    if (part.type === "text") {
      return { type: "text", text: part.text };
    }
    if (part.type === "document" && part.source) {
      return {
        type: "document",
        source: {
          type: "base64",
          media_type: part.source.mediaType,
          data: part.source.data,
        },
      };
    }
    if (part.type === "image" && part.source) {
      return {
        type: "image",
        source: {
          type: "base64",
          media_type: part.source.mediaType,
          data: part.source.data,
        },
      };
    }
    return { type: "text", text: "" };
  });
}

// ============================================================================
// Gemini Client
// ============================================================================

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

async function createGeminiCompletion(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  const client = getGeminiClient();
  const modelName = options.model || DEFAULT_MODELS.gemini;
  const model = client.getGenerativeModel({ model: modelName });

  // For Gemini, we need to handle the conversation differently
  // Gemini uses a different format - we'll convert the last user message
  const lastMessage = messages[messages.length - 1];
  
  if (!lastMessage || lastMessage.role !== "user") {
    throw new Error("Last message must be from user");
  }

  const parts = convertToGeminiParts(lastMessage.content);

  // If there are previous messages, use chat mode
  if (messages.length > 1) {
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: typeof msg.content === "string" ? msg.content : extractTextFromParts(msg.content) }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(parts);
    const response = result.response;

    return {
      text: response.text(),
      provider: "gemini",
      model: modelName,
    };
  }

  // Single message - use generateContent
  const result = await model.generateContent(parts);
  const response = result.response;

  return {
    text: response.text(),
    provider: "gemini",
    model: modelName,
  };
}

function convertToGeminiParts(content: string | AIContentPart[]): Part[] {
  if (typeof content === "string") {
    return [{ text: content }];
  }

  return content.map((part): Part => {
    if (part.type === "text") {
      return { text: part.text || "" };
    }
    if ((part.type === "document" || part.type === "image") && part.source) {
      // Gemini uses inlineData for images/documents
      return {
        inlineData: {
          mimeType: part.source.mediaType,
          data: part.source.data,
        },
      };
    }
    return { text: "" };
  });
}

function extractTextFromParts(content: string | AIContentPart[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((p) => p.type === "text")
    .map((p) => p.text || "")
    .join("\n");
}

// ============================================================================
// OpenAI Client
// ============================================================================

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

async function createOpenAICompletion(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  const client = getOpenAIClient();
  const model = options.model || DEFAULT_MODELS.openai;

  // Convert our message format to OpenAI's format
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map((msg) => {
    const content = convertToOpenAIContent(msg.content);
    if (msg.role === "user") {
      return {
        role: "user" as const,
        content,
      };
    }
    // For assistant messages, content must be string or null
    return {
      role: "assistant" as const,
      content: typeof content === "string" ? content : content.map(c => c.type === "text" ? c.text : "").join("\n"),
    };
  });

  const response = await client.chat.completions.create({
    model,
    max_tokens: options.maxTokens || 4000,
    temperature: options.temperature,
    messages: openaiMessages,
  });

  const text = response.choices[0]?.message?.content || "";

  return {
    text,
    provider: "openai",
    model,
  };
}

function convertToOpenAIContent(
  content: string | AIContentPart[]
): string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> {
  if (typeof content === "string") {
    return content;
  }

  // OpenAI uses a different format for multi-part content
  return content.map((part) => {
    if (part.type === "text") {
      return { type: "text" as const, text: part.text || "" };
    }
    if ((part.type === "image" || part.type === "document") && part.source) {
      // OpenAI uses data URL format for images
      return {
        type: "image_url" as const,
        image_url: {
          url: `data:${part.source.mediaType};base64,${part.source.data}`,
        },
      };
    }
    return { type: "text" as const, text: "" };
  });
}

// ============================================================================
// Unified API
// ============================================================================

/**
 * Create an AI completion using the configured provider
 */
export async function createCompletion(
  messages: AIMessage[],
  options: AICompletionOptions & { provider?: AIProvider } = {}
): Promise<AICompletionResult> {
  const provider = options.provider || getActiveProvider();

  if (!isProviderConfigured(provider)) {
    const envVars: Record<AIProvider, string> = {
      anthropic: "ANTHROPIC_API_KEY",
      gemini: "GOOGLE_AI_API_KEY",
      openai: "OPENAI_API_KEY",
    };
    throw new Error(
      `AI provider "${provider}" is not configured. ` +
      `Please set ${envVars[provider]} in your environment.`
    );
  }

  if (provider === "openai") {
    return createOpenAICompletion(messages, options);
  }

  if (provider === "gemini") {
    return createGeminiCompletion(messages, options);
  }

  return createAnthropicCompletion(messages, options);
}

/**
 * Simple text completion helper
 */
export async function complete(
  prompt: string,
  options: AICompletionOptions & { provider?: AIProvider } = {}
): Promise<string> {
  const result = await createCompletion(
    [{ role: "user", content: prompt }],
    options
  );
  return result.text;
}

/**
 * Completion with document/image input
 */
export async function completeWithDocument(
  prompt: string,
  document: { data: string; mediaType: string },
  options: AICompletionOptions & { provider?: AIProvider } = {}
): Promise<AICompletionResult> {
  const content: AIContentPart[] = [
    {
      type: "document",
      source: {
        type: "base64",
        mediaType: document.mediaType,
        data: document.data,
      },
    },
    {
      type: "text",
      text: prompt,
    },
  ];

  return createCompletion([{ role: "user", content }], options);
}

// ============================================================================
// Helper: Parse JSON from AI response
// ============================================================================

export function parseJSONResponse<T = any>(text: string): T {
  // Try to extract JSON if it's wrapped in markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonString = jsonMatch ? jsonMatch[1] : text;
  return JSON.parse(jsonString);
}

// ============================================================================
// OpenAI Web Search (for Outreach feature)
// ============================================================================

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export { getOpenAIClient };

