interface SuggestionDiffProps {
  original: string;
  suggested: string;
  type: "modify" | "add" | "remove";
}

export default function SuggestionDiff({
  original,
  suggested,
  type,
}: SuggestionDiffProps) {
  if (type === "add") {
    return (
      <div className="space-y-2">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-semibold text-green-700 mb-1">
            + TO BE ADDED
          </p>
          <p className="text-sm text-green-900">{suggested}</p>
        </div>
      </div>
    );
  }

  if (type === "remove") {
    return (
      <div className="space-y-2">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs font-semibold text-red-700 mb-1">
            - TO BE REMOVED
          </p>
          <p className="text-sm text-red-900 line-through">{original}</p>
        </div>
      </div>
    );
  }

  // Modify type
  return (
    <div className="space-y-2">
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-xs font-semibold text-red-700 mb-1">- CURRENT</p>
        <p className="text-sm text-red-900">{original}</p>
      </div>
      <div className="flex justify-center">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs font-semibold text-green-700 mb-1">
          + SUGGESTED
        </p>
        <p className="text-sm text-green-900">{suggested}</p>
      </div>
    </div>
  );
}
