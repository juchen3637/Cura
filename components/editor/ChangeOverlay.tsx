"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import type { InlineSuggestion } from "@/types/suggestion";

interface ChangeOverlayProps {
  suggestion: InlineSuggestion;
  position: { top: number; left: number };
}

export default function ChangeOverlay({ suggestion, position }: ChangeOverlayProps) {
  const { applySuggestion, rejectSuggestion } = useResumeStore();
  const [expanded, setExpanded] = useState(false);

  if (suggestion.status !== "pending") {
    return null;
  }

  const handleApprove = () => {
    applySuggestion(suggestion.id);
  };

  const handleDecline = () => {
    rejectSuggestion(suggestion.id);
  };

  return (
    <div
      className="absolute z-50 bg-white border-2 border-blue-400 rounded-lg shadow-xl p-4 max-w-md"
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-gray-900 text-sm">Suggested Change</h4>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={expanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          </button>
        </div>

        {/* Current Text (Red) */}
        <div className="p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs font-semibold text-red-700 mb-1">Current:</p>
          <p className="text-sm text-red-900 line-through">{suggestion.originalText}</p>
        </div>

        {/* Suggested Text (Green) */}
        <div className="p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs font-semibold text-green-700 mb-1">Suggested:</p>
          <p className="text-sm text-green-900">{suggestion.suggestedText}</p>
        </div>

        {/* Reason (if expanded) */}
        {expanded && suggestion.reasoning && (
          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
            <p className="text-xs font-semibold text-gray-700 mb-1">Why:</p>
            <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApprove}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
          >
            Approve
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
