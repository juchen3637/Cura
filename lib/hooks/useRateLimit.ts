import { useQuery } from "@tanstack/react-query";

export type APIType = "ai_analyze" | "ai_build" | "pdf_import";

interface RateLimitResult {
  allowed: boolean;
  current_count: number;
  limit: number;
  remaining: number;
  reset_date: string;
}

export function useRateLimit(apiType: APIType) {
  return useQuery({
    queryKey: ["rate-limit", apiType],
    queryFn: async () => {
      const response = await fetch(`/api/rate-limit?apiType=${apiType}`);
      if (!response.ok) {
        if (response.status === 401) return null; // Not authenticated
        throw new Error("Failed to fetch rate limit");
      }
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    retry: false,
  });
}

export async function checkRateLimit(apiType: APIType): Promise<RateLimitResult> {
  const response = await fetch("/api/rate-limit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiType }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 429) {
      throw new Error(
        `Rate limit exceeded. ${error.remaining || 0} calls remaining. Resets on ${new Date(
          error.reset_date
        ).toLocaleDateString()}`
      );
    }
    throw new Error(error.error || "Rate limit check failed");
  }

  return response.json();
}
