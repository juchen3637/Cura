import { useResumeStore } from "@/store/resumeStore";
import type { InlineSuggestion } from "@/types/suggestion";
import SuggestionDiff from "./SuggestionDiff";

interface SuggestionCardProps {
  suggestion: InlineSuggestion;
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const { applySuggestion, rejectSuggestion, activeSuggestionId, setActiveSuggestion } =
    useResumeStore();

  const isActive = activeSuggestionId === suggestion.id;
  const isPending = suggestion.status === "pending";
  const isApplied = suggestion.status === "applied";
  const isRejected = suggestion.status === "rejected";

  const handleApply = () => {
    applySuggestion(suggestion.id);
  };

  const handleReject = () => {
    rejectSuggestion(suggestion.id);
  };

  const borderColorClasses = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    yellow: "border-l-yellow-500",
    purple: "border-l-purple-500",
  };

  const statusBadge = () => {
    if (isApplied) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Applied
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Rejected
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-white border-l-4 ${borderColorClasses[suggestion.highlightColor]} ${
        isActive ? "ring-2 ring-blue-300" : ""
      } rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all ${
        !isPending ? "opacity-60" : ""
      }`}
      onClick={() => setActiveSuggestion(suggestion.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
            {statusBadge()}
          </div>
          <p className="text-sm text-gray-600">{suggestion.description}</p>
          {suggestion.reasoning && (
            <p className="text-xs text-gray-500 mt-1 italic">{suggestion.reasoning}</p>
          )}
        </div>
      </div>

      {/* Diff View */}
      {suggestion.type === "modify" && suggestion.originalText && suggestion.suggestedText && (
        <div className="mb-3">
          <SuggestionDiff
            original={suggestion.originalText}
            suggested={suggestion.suggestedText}
            type="modify"
          />
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleApply();
            }}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            ✓ Apply
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReject();
            }}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  );
}
