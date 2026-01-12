"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useResumes } from "@/lib/hooks/useResumes";
import { useToast } from "@/lib/hooks/useToast";
import Toast from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";

interface CoverLetterData {
  recipientName?: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  additionalInfo?: string;
}

export default function CoverLetterPage() {
  const router = useRouter();
  const supabase = createClient();
  const { data: resumes, isLoading: resumesLoading } = useResumes();
  const { toast, hideToast, success, error: showError } = useToast();

  const [user, setUser] = useState<any>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    additionalInfo: "",
  });
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.push("/auth/login");
      }
    });
  }, [supabase.auth, router]);

  const handleGenerate = async () => {
    if (!selectedResumeId) {
      showError("Please select a resume");
      return;
    }

    if (!coverLetterData.companyName || !coverLetterData.jobTitle) {
      showError("Please fill in company name and job title");
      return;
    }

    setIsGenerating(true);

    try {
      const selectedResume = resumes?.find((r: any) => r.id === selectedResumeId);
      if (!selectedResume) {
        throw new Error("Resume not found");
      }

      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: selectedResume.resume_data,
          coverLetterData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate cover letter");
      }

      const data = await response.json();
      setGeneratedCoverLetter(data.coverLetter);
      success("Cover letter generated successfully!");
    } catch (error: any) {
      console.error("Generation error:", error);
      showError(error.message || "Failed to generate cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedCoverLetter) {
      showError("Please generate a cover letter first");
      return;
    }

    // Set document title for PDF filename
    const originalTitle = document.title;
    const filename = `${coverLetterData.companyName}_Cover_Letter`.replace(/[^a-zA-Z0-9\s\-_()]/g, "");
    document.title = filename;

    // Trigger print dialog
    window.print();

    // Restore original title
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  if (!user || resumesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cover Letter Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate a professional cover letter based on your resume and job details
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Resume Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Resume
              </h2>
              {!resumes || resumes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don&apos;t have any resumes yet
                  </p>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create a Resume
                  </button>
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a resume...</option>
                  {resumes.map((resume: any) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} (Updated {new Date(resume.updated_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Job Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Job Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={coverLetterData.recipientName || ""}
                    onChange={(e) =>
                      setCoverLetterData({ ...coverLetterData, recipientName: e.target.value })
                    }
                    placeholder="Hiring Manager or specific name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={coverLetterData.companyName}
                    onChange={(e) =>
                      setCoverLetterData({ ...coverLetterData, companyName: e.target.value })
                    }
                    placeholder="e.g., Google"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={coverLetterData.jobTitle}
                    onChange={(e) =>
                      setCoverLetterData({ ...coverLetterData, jobTitle: e.target.value })
                    }
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={coverLetterData.jobDescription}
                    onChange={(e) =>
                      setCoverLetterData({ ...coverLetterData, jobDescription: e.target.value })
                    }
                    placeholder="Paste the job description or key requirements here..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    value={coverLetterData.additionalInfo || ""}
                    onChange={(e) =>
                      setCoverLetterData({ ...coverLetterData, additionalInfo: e.target.value })
                    }
                    placeholder="Any specific points you want to highlight or mention..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !resumes || resumes.length === 0}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    "Generate Cover Letter"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cover Letter Preview
              </h2>
              {generatedCoverLetter && (
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export PDF
                </button>
              )}
            </div>

            {generatedCoverLetter ? (
              <div
                id="cover-letter-preview"
                className="bg-white p-8 rounded-lg border border-gray-200 min-h-[11in] max-h-[11in] overflow-auto print:shadow-none print:border-0"
              >
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {generatedCoverLetter}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                  <p className="text-gray-500 dark:text-gray-400">
                    Your cover letter will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cover-letter-preview,
          #cover-letter-preview * {
            visibility: visible;
          }
          #cover-letter-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0.5in;
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
}
