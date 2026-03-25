"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OutreachRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ai-workspace?tab=outreach");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting...{" "}
          <Link href="/ai-workspace?tab=outreach" className="text-blue-600 underline">
            Click here if not redirected
          </Link>
        </p>
      </div>
    </div>
  );
}
