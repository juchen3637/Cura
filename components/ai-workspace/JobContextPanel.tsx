"use client";

import { useResumes } from "@/lib/hooks/useResumes";
import { useJobContextStore } from "@/store/jobContextStore";

export default function JobContextPanel() {
  const { data: resumes, isLoading: resumesLoading } = useResumes();
  const { jobDescription, jobTitle, company, selectedResumeId, setJobDescription, setJobTitle, setCompany, setSelectedResumeId } = useJobContextStore();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Enter the job details once here — they&apos;ll be shared across Analyze, Build, Outreach, and Cover Letter tabs automatically.
          </p>
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          The more complete the job description, the better the AI results across all tools.
        </p>
      </div>

      {/* Job Title + Company */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Job Details <span className="text-gray-400 font-normal">(helps AI tailor content)</span>
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Inc"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Resume Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Resume to Use <span className="text-gray-400 font-normal">(for Analyze and Outreach)</span>
        </label>
        <select
          value={selectedResumeId}
          onChange={(e) => setSelectedResumeId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a resume...</option>
          {resumesLoading ? (
            <option disabled>Loading resumes...</option>
          ) : (
            resumes?.map((resume: any) => (
              <option key={resume.id} value={resume.id}>
                {resume.title} (Updated {new Date(resume.updated_at).toLocaleDateString()})
              </option>
            ))
          )}
        </select>
        {!resumesLoading && resumes?.length === 0 && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            No saved resumes yet.{" "}
            <a href="/dashboard" className="underline hover:no-underline">Create one in My Resumes</a>{" "}
            or use the Analyze tab to upload a PDF directly.
          </p>
        )}
      </div>

      {/* Next Step CTA */}
      {jobDescription.trim() && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            Job context is set. Switch to any tab to start generating.
          </p>
          <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
