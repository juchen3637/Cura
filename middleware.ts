import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // Protected routes that require authentication
  const protectedPaths = ["/dashboard", "/profile", "/ai-workspace", "/outreach"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Admin-only routes
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  // If accessing a protected route without being logged in, redirect to login
  if ((isProtectedPath || isAdminPath) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return Response.redirect(redirectUrl);
  }

  // If accessing admin route, check if user is admin
  if (isAdminPath && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return Response.redirect(redirectUrl);
    }
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  if (user && request.nextUrl.pathname.startsWith("/auth/")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return Response.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
