import { useResumeStore } from "@/store/resumeStore";
import SuggestionIndicator from "./SuggestionIndicator";
import type { InlineSuggestion } from "@/types/suggestion";

interface HighlightedSectionProps {
  children: React.ReactNode;
  suggestions: InlineSuggestion[];
  sectionId: string;
  onSelectSuggestion?: (id: string) => void;
}

export default function HighlightedSection({
  children,
  suggestions,
  sectionId,
  onSelectSuggestion,
}: HighlightedSectionProps) {
  const { setActiveSuggestion, setShowSuggestions } = useResumeStore();

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const hasSuggestions = pendingSuggestions.length > 0;

  if (!hasSuggestions) {
    return <div className="relative">{children}</div>;
  }

  const primaryColor = pendingSuggestions[0].highlightColor;

  const borderColorClasses = {
    blue: "ring-2 ring-blue-400 bg-blue-50/30",
    green: "ring-2 ring-green-400 bg-green-50/30",
    yellow: "ring-2 ring-yellow-400 bg-yellow-50/30",
    purple: "ring-2 ring-purple-400 bg-purple-50/30",
  };

  const handleClick = () => {
    if (pendingSuggestions[0]) {
      setActiveSuggestion(pendingSuggestions[0].id);
      setShowSuggestions(true);
      if (onSelectSuggestion) {
        onSelectSuggestion(pendingSuggestions[0].id);
      }
    }
  };

  return (
    <div className={`relative rounded-lg ${borderColorClasses[primaryColor]} p-3`}>
      <SuggestionIndicator
        count={pendingSuggestions.length}
        color={primaryColor}
        onClick={handleClick}
      />
      {children}
    </div>
  );
}
