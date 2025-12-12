"use client";

import { useResumeStore } from "@/store/resumeStore";

export default function SuggestionsPanel() {
  const {
    aiSuggestions,
    showSuggestions,
    setShowSuggestions,
    clearSuggestions,
  } = useResumeStore();

  if (!showSuggestions) {
    return null;
  }

  const resumeSuggestions = aiSuggestions.find((s) => s.type === "resume")?.suggestions || [];

  if (resumeSuggestions.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setShowSuggestions(false)}
      ></div>

      <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">AI Suggestions</h2>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Review AI-powered improvements to your resume
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 mr-3"
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
                <h3 className="text-sm font-semibold text-blue-900 mb-1">How to use</h3>
                <p className="text-sm text-blue-800">
                  These suggestions are based on the job description. Review and manually apply the ones that make sense.
                </p>
              </div>
            </div>
          </div>

          {resumeSuggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
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
                Resume Improvements ({resumeSuggestions.length})
              </h3>
              <div className="space-y-3">
                {resumeSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-sm text-gray-700 leading-relaxed">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={clearSuggestions}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Dismiss All
            </button>
            <button
              onClick={() => setShowSuggestions(false)}
              className="flex-1 px-4 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
