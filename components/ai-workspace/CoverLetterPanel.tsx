"use client";

import { useState } from "react";
import { useResumes } from "@/lib/hooks/useResumes";
import { useToast } from "@/lib/hooks/useToast";
import { useJobContextStore } from "@/store/jobContextStore";

export default function CoverLetterPanel() {
  const { data: resumes, isLoading: resumesLoading } = useResumes();
  const { success, error: showError } = useToast();
  const { jobDescription, jobTitle, company, selectedResumeId } = useJobContextStore();

  const [recipientName, setRecipientName] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingContext = !selectedResumeId || !company.trim() || !jobTitle.trim();

  const handleGenerate = async () => {
    if (!selectedResumeId) {
      setError("Please select a resume in the Job Context tab");
      return;
    }
    if (!company.trim() || !jobTitle.trim()) {
      setError("Please fill in company name and job title in the Job Context tab");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const selectedResume = resumes?.find((r: any) => r.id === selectedResumeId);
      if (!selectedResume) throw new Error("Resume not found");

      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: selectedResume.resume_data,
          coverLetterData: {
            recipientName,
            companyName: company,
            jobTitle,
            jobDescription,
            additionalInfo,
          },
        }),
      });

      if (!response.ok) {
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const err = isJson ? await response.json() : { error: `Server error ${response.status}` };
        throw new Error(err.error || "Failed to generate cover letter");
      }

      const data = await response.json();
      setGeneratedCoverLetter(data.coverLetter);
      success("Cover letter generated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate cover letter";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedCoverLetter) {
      showError("Please generate a cover letter first");
      return;
    }
    const originalTitle = document.title;
    document.title = `${company}_Cover_Letter`.replace(/[^a-zA-Z0-9\s\-_()]/g, "");
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Column - Form */}
      <div className="space-y-6">
        {/* Context warning */}
        {missingContext && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {!selectedResumeId
                ? "Select a resume in the Job Context tab."
                : "Fill in Job Title and Company in the Job Context tab."}
            </p>
          </div>
        )}

        {/* Context summary */}
        {!missingContext && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Using from Job Context</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Role:</span> {jobTitle} at {company}</p>
              <p><span className="font-medium">Resume:</span> {resumes?.find((r: any) => r.id === selectedResumeId)?.title}</p>
              {jobDescription && <p className="text-xs text-green-600 dark:text-green-400">Job description included</p>}
            </div>
          </div>
        )}

        {/* Additional fields */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Cover Letter Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Hiring Manager or specific name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Information <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Any specific points you want to highlight or mention..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || missingContext}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cover Letter Preview</h2>
          {generatedCoverLetter && (
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{generatedCoverLetter}</div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[500px] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                {missingContext ? "Complete Job Context first, then generate." : "Your cover letter will appear here"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #cover-letter-preview, #cover-letter-preview * { visibility: visible; }
          #cover-letter-preview {
            position: absolute; left: 0; top: 0;
            width: 100%; padding: 0.5in; max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
}
