"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useResumes } from "@/lib/hooks/useResumes";
import { useResumeStore } from "@/store/resumeStore";
import { useJobContextStore } from "@/store/jobContextStore";

interface UploadedFile {
  name: string;
  content: string;
  base64Data?: string;
  mediaType?: string;
  type: "resume";
}

interface SuggestedChange {
  section: string;
  sectionIndex: number;
  field: string;
  bulletIndex?: number;
  currentText: string;
  suggestedText: string;
  reason: string;
}

interface AnalysisResult {
  changes: SuggestedChange[];
  keyRequirements: string[];
  overallFit: string;
}

interface AnalyzeModeProps {
  addTask: (mode: "analyze" | "build", jobDescription: string, jobTitle?: string, company?: string, resumeData?: string) => Promise<string>;
}

export default function AnalyzeMode({ addTask }: AnalyzeModeProps) {
  const router = useRouter();
  const supabase = createClient();
  const { data: savedResumes } = useResumes();
  const { setResume: setResumeInStore, setAiSuggestions, setShowSuggestions } = useResumeStore();

  const { jobDescription, jobTitle, company, selectedResumeId, setJobDescription, setJobTitle, setCompany, setSelectedResumeId } = useJobContextStore();

  const [user, setUser] = useState<any>(null);
  const [resume, setResume] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  const parseAndSaveResume = async (base64Data: string) => {
    try {
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfData: base64Data,
          mediaType: "application/pdf",
        }),
      });

      if (response.ok) {
        const parsedResume = await response.json();
        setResumeInStore(parsedResume);
      }
    } catch (err) {
      console.error("Failed to parse resume:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const uploadedFile: UploadedFile = {
        name: file.name,
        content: "",
        base64Data,
        mediaType: "application/pdf",
        type: "resume",
      };

      setResume(uploadedFile);
      setSelectedResumeId("");
      await parseAndSaveResume(base64Data);
      setError(null);
    } catch (err) {
      setError("Failed to read file. Please try again.");
    }
  };

  const handleSavedResumeSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resumeId = e.target.value;
    setSelectedResumeId(resumeId);

    if (!resumeId || !savedResumes) {
      setResume(null);
      return;
    }

    const selectedResume = savedResumes.find((r: any) => r.id === resumeId);
    if (selectedResume) {
      setResumeInStore(selectedResume.resume_data);
      setResume({
        name: selectedResume.title,
        content: JSON.stringify(selectedResume.resume_data),
        type: "resume",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    if (!resume) {
      setError("Please select or upload a resume.");
      return;
    }

    setError(null);

    try {
      // Prepare resume data for the task
      const resumeData = JSON.stringify(
        resume.base64Data
          ? {
              base64Data: resume.base64Data,
              mediaType: resume.mediaType,
              fileName: resume.name,
            }
          : {
              content: resume.content,
              fileName: resume.name,
            }
      );

      // Add task to queue
      await addTask("analyze", jobDescription, jobTitle, company, resumeData);

      // Clear local resume file only — keep shared selectedResumeId so Outreach/Cover Letter tabs retain the selection
      setResume(null);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("migration")
          ? "Please run the database migration first. Check the console for details."
          : "Failed to add task to queue. Please try again."
      );
    }
  };

  const handleRemoveFile = () => {
    setResume(null);
    setSelectedResumeId("");
  };

  return (
    <div className="space-y-6">
      {/* Resume Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Resume <span className="text-red-500">*</span>
          </h3>
        </div>

        {/* Saved Resume Selector (if logged in) */}
        {user && savedResumes && savedResumes.length > 0 && !resume && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select from your saved resumes
            </label>
            <select
              value={selectedResumeId}
              onChange={handleSavedResumeSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a saved resume...</option>
              {savedResumes.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">Or upload a new PDF below</p>
          </div>
        )}

        {/* Resume Status or Upload */}
        {resume ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center min-w-0">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-2 text-sm text-green-900 truncate">
                  {resume.name}
                </span>
              </div>
              <button
                onClick={handleRemoveFile}
                className="ml-2 text-green-700 hover:text-green-900"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <label className="block cursor-pointer">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <svg
                className="w-8 h-8 text-gray-400 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600">Upload resume PDF</p>
              <p className="text-xs text-gray-500 mt-1">PDF only</p>
            </div>
          </label>
        )}
      </div>

      {/* Job Context Summary */}
      {jobDescription.trim() ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                {jobTitle ? `${jobTitle}${company ? ` at ${company}` : ""}` : "Job context loaded"}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 line-clamp-2">
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

      {/* Analyze Button */}
      <div className="text-center">
        <button
          onClick={handleAnalyze}
          disabled={!resume || !jobDescription.trim()}
          className="inline-flex items-center px-8 py-4 rounded-lg text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
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

      {/* Error */}
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
