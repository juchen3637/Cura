"use client";

import { useRateLimit } from "@/lib/hooks/useRateLimit";

export default function UsageDisplay() {
  const { data: aiAnalyzeUsage } = useRateLimit("ai_analyze");
  const { data: aiBuildUsage } = useRateLimit("ai_build");
  const { data: pdfImportUsage } = useRateLimit("pdf_import");

  if (!aiAnalyzeUsage && !aiBuildUsage) return null;

  const isAdmin = aiAnalyzeUsage?.role === "admin" || aiBuildUsage?.role === "admin";
  const totalAIUsed = (aiAnalyzeUsage?.current_count || 0) + (aiBuildUsage?.current_count || 0);
  const totalAILimit = aiAnalyzeUsage?.limit || 30;
  const totalAIRemaining = Math.max(0, totalAILimit - totalAIUsed);

  const resetDate = aiAnalyzeUsage?.reset_date || aiBuildUsage?.reset_date;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        {isAdmin ? "API Usage (Admin - Safety Limits)" : "Monthly Usage"}
      </h3>

      <div className="space-y-3">
        {/* AI Calls */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">AI Analysis & Building</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {totalAIUsed} / {totalAILimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                totalAIRemaining === 0
                  ? "bg-red-500"
                  : totalAIRemaining <= 5
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(100, (totalAIUsed / totalAILimit) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totalAIRemaining} calls remaining
          </p>
        </div>

        {/* PDF Imports */}
        {pdfImportUsage && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">PDF Imports</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {pdfImportUsage.current_count} / {pdfImportUsage.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (pdfImportUsage.current_count / pdfImportUsage.limit) * 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {pdfImportUsage.remaining} imports remaining
            </p>
          </div>
        )}

        {resetDate && (
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            Resets on {new Date(resetDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}

        {isAdmin && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 mt-2">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              ⚡ Admin account - Safety limits prevent infinite loops
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
