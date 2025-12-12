export type SuggestionType = "add" | "modify" | "remove" | "reorder";

export type SectionType = "basics" | "experience" | "education" | "project" | "skills" | "summary";

export interface InlineSuggestion {
  id: string;
  type: SuggestionType;
  section: SectionType;

  // For targeting specific items
  sectionIndex?: number; // Index in array (e.g., which experience)
  field?: string; // Specific field (e.g., "role", "bullets[0]")
  bulletIndex?: number; // Index in bullets array

  // For modify suggestions
  originalText?: string;
  suggestedText?: string;

  // For add suggestions
  suggestedItem?: any;

  // Display information
  title: string;
  description: string;
  reasoning?: string;

  // UI state
  status: "pending" | "applied" | "rejected";
  highlightColor: "blue" | "green" | "yellow" | "purple";

  // Location info for scrolling/focusing
  elementPath?: string;
}

export interface SuggestionGroup {
  section: SectionType;
  suggestions: InlineSuggestion[];
  count: number;
}

export interface StructuredSuggestions {
  suggestions: InlineSuggestion[];
  summary: string;
  totalCount: number;
}
