"use client";

import { useState } from "react";
import { useJobContextStore } from "@/store/jobContextStore";

interface CuratedResult {
  resume: any;
  selections: {
    experiences: string[];
    education: string[];
    projects: string[];
    skillCategories: string[];
  };
  reasoning: string;
  inlineSuggestions: any[];
}

interface BuildPreferences {
  maxBulletsPerExperience?: number;
  maxBulletsPerProject?: number;
}

interface BuildCuratedModeProps {
  addTask: (mode: "analyze" | "build", jobDescription: string, jobTitle?: string, company?: string, resumeData?: string, preferences?: BuildPreferences) => Promise<string>;
}

export default function BuildCuratedMode({ addTask }: BuildCuratedModeProps) {
  const { jobDescription, jobTitle, company } = useJobContextStore();
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxBulletsPerExperience, setMaxBulletsPerExperience] = useState(3);
  const [maxBulletsPerProject, setMaxBulletsPerProject] = useState(3);

  const handleBuild = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setError(null);

    try {
      // Add task to queue with preferences
      await addTask("build", jobDescription, jobTitle, company, undefined, {
        maxBulletsPerExperience,
        maxBulletsPerProject,
      });

    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("migration")
          ? "Please run the database migration first. Check the console for details."
          : "Failed to add task to queue. Please try again."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-purple-900 mb-1">
              How AI Curated Builder Works
            </h3>
            <p className="text-sm text-purple-800">
              The AI analyzes your entire profile and selects the best experiences,
              projects, and skills that match the job requirements. It then tailors
              the content to highlight your most relevant achievements.
            </p>
          </div>
        </div>
      </div>

      {/* Job Context Summary */}
      {jobDescription ? (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                {jobTitle ? `${jobTitle}${company ? ` at ${company}` : ""}` : "Job context loaded"}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1 line-clamp-2">
                {jobDescription.slice(0, 120)}{jobDescription.length > 120 ? "..." : ""}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            No job description set. Go to the <strong>Job Context</strong> tab and paste a job description first.
          </p>
        </div>
      )}

      {/* Advanced Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Advanced Options
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showAdvanced && (
          <div className="px-6 pb-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max bullets per experience
                </label>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {maxBulletsPerExperience}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={maxBulletsPerExperience}
                onChange={(e) => setMaxBulletsPerExperience(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>5</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max bullets per project
                </label>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {maxBulletsPerProject}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={maxBulletsPerProject}
                onChange={(e) => setMaxBulletsPerProject(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>5</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Industry standard is 3 bullets per entry. The AI will select the most relevant bullets for each experience and project.
            </p>
          </div>
        )}
      </div>

      {/* Build Button */}
      <div className="text-center">
        <button
          onClick={handleBuild}
          disabled={!jobDescription.trim()}
          className="inline-flex items-center px-8 py-4 rounded-lg text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add to Queue
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
