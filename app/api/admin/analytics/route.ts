import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get active users (users who created something in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activeUserData } = await supabase
      .from("resumes")
      .select("user_id")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const activeUsers = new Set(activeUserData?.map((r) => r.user_id) || []).size;

    // Get total resumes
    const { count: totalResumes } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true });

    // Get AI tasks stats
    const { count: totalAITasks } = await supabase
      .from("ai_tasks")
      .select("*", { count: "exact", head: true });

    const { count: completedAITasks } = await supabase
      .from("ai_tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    const { data: aiTasksByMode } = await supabase
      .from("ai_tasks")
      .select("mode");

    const analyzeCount = aiTasksByMode?.filter((t) => t.mode === "analyze").length || 0;
    const buildCount = aiTasksByMode?.filter((t) => t.mode === "build").length || 0;

    // Get experiences, education, projects, skills stats
    const { count: totalExperiences } = await supabase
      .from("experiences")
      .select("*", { count: "exact", head: true });

    const { count: totalEducation } = await supabase
      .from("education")
      .select("*", { count: "exact", head: true });

    const { count: totalProjects } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    const { count: totalSkillCategories } = await supabase
      .from("skill_categories")
      .select("*", { count: "exact", head: true });

    // Get recent sign-ups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSignups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    // Get API usage stats
    const { data: rateLimits } = await supabase
      .from("rate_limits")
      .select("api_type, call_count");

    const aiAnalyzeCalls = rateLimits?.filter((r) => r.api_type === "ai_analyze").reduce((sum, r) => sum + r.call_count, 0) || 0;
    const aiBuildCalls = rateLimits?.filter((r) => r.api_type === "ai_build").reduce((sum, r) => sum + r.call_count, 0) || 0;
    const pdfImportCalls = rateLimits?.filter((r) => r.api_type === "pdf_import").reduce((sum, r) => sum + r.call_count, 0) || 0;

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        active: activeUsers || 0,
        recentSignups: recentSignups || 0,
      },
      resumes: {
        total: totalResumes || 0,
      },
      aiTasks: {
        total: totalAITasks || 0,
        completed: completedAITasks || 0,
        analyze: analyzeCount,
        build: buildCount,
      },
      profile: {
        experiences: totalExperiences || 0,
        education: totalEducation || 0,
        projects: totalProjects || 0,
        skillCategories: totalSkillCategories || 0,
      },
      apiUsage: {
        aiAnalyze: aiAnalyzeCalls,
        aiBuild: aiBuildCalls,
        pdfImport: pdfImportCalls,
        totalAI: aiAnalyzeCalls + aiBuildCalls,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
