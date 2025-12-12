import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { apiType } = await req.json();

    if (!apiType || !["ai_analyze", "ai_build", "pdf_import"].includes(apiType)) {
      return NextResponse.json({ error: "Invalid API type" }, { status: 400 });
    }

    // Get max calls based on API type
    let maxCalls = 30; // Default for AI calls
    if (apiType === "pdf_import") {
      maxCalls = 100; // PDF import limit
    }

    // Check and increment rate limit using database function
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_user_id: user.id,
      p_api_type: apiType,
      p_max_calls: maxCalls,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data as any;

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          ...result,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Rate limit error:", error);
    return NextResponse.json(
      { error: "Failed to check rate limit" },
      { status: 500 }
    );
  }
}

// Get current usage without incrementing
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const apiType = searchParams.get("apiType");

    if (!apiType) {
      return NextResponse.json({ error: "API type required" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("get_rate_limit_usage", {
      p_user_id: user.id,
      p_api_type: apiType,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get usage" },
      { status: 500 }
    );
  }
}
