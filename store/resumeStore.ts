import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Resume, ResumeLink } from "@/types/resume";
import { InlineSuggestion } from "@/types/suggestion";

// Normalize resume data to handle backward compatibility
// Converts old string[] links to new ResumeLink[] format
function normalizeResume(resume: Resume): Resume {
  if (!resume?.basics?.contact?.links) return resume;
  
  const normalizedLinks: ResumeLink[] = resume.basics.contact.links.map((link: any) => {
    // If already in new format, return as is
    if (typeof link === 'object' && 'url' in link) {
      return { url: link.url || '', displayName: link.displayName || '' };
    }
    // Convert string to new format
    return { url: String(link), displayName: '' };
  });
  
  return {
    ...resume,
    basics: {
      ...resume.basics,
      contact: {
        ...resume.basics.contact,
        links: normalizedLinks,
      },
    },
  };
}

interface AISuggestion {
  type: "resume" | "coverLetter";
  suggestions: string[];
}

export interface ResumeStyleSettings {
  bodyTextSize: number;      // pt
  nameSize: number;          // pt
  sectionHeaderSize: number; // pt
  contactLineSize: number;   // pt
  sectionMargin: number;     // tailwind spacing unit (0.25rem each)
  entrySpacing: number;      // tailwind spacing unit
  bulletIndent: number;      // tailwind spacing unit
  headerMargin: number;      // tailwind spacing unit
  lineHeight: "tight" | "snug" | "normal";
}

export const defaultStyleSettings: ResumeStyleSettings = {
  bodyTextSize: 10,
  nameSize: 16,
  sectionHeaderSize: 11,
  contactLineSize: 10,
  sectionMargin: 1.5,
  entrySpacing: 1,
  bulletIndent: 2,
  headerMargin: 1,
  lineHeight: "snug",
};

interface ResumeState {
  resume: Resume;
  styleSettings: ResumeStyleSettings;
  aiEnabled: boolean;
  aiSuggestions: AISuggestion[];
  inlineSuggestions: InlineSuggestion[];
  showSuggestions: boolean;
  activeSuggestionId: string | null;
  // Task metadata for auto-naming resumes
  currentTaskMeta: { jobTitle: string; company: string } | null;
  setResume: (resume: Resume) => void;
  updateResume: (updater: (resume: Resume) => Resume) => void;
  setStyleSettings: (settings: Partial<ResumeStyleSettings>) => void;
  resetStyleSettings: () => void;
  setAiEnabled: (enabled: boolean) => void;
  setAiSuggestions: (suggestions: AISuggestion[]) => void;
  setInlineSuggestions: (suggestions: InlineSuggestion[]) => void;
  setShowSuggestions: (show: boolean) => void;
  setActiveSuggestion: (id: string | null) => void;
  setCurrentTaskMeta: (meta: { jobTitle: string; company: string } | null) => void;
  applySuggestion: (id: string) => void;
  rejectSuggestion: (id: string) => void;
  clearSuggestions: () => void;
}

const defaultResume: Resume = {
  version: "1.0",
  basics: {
    name: "",
    title: "",
    location: "",
    contact: {
      email: "",
      phone: "",
      links: [],
    },
    summary: "",
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resume: defaultResume,
      styleSettings: defaultStyleSettings,
      aiEnabled: false,
      aiSuggestions: [],
      inlineSuggestions: [],
      showSuggestions: false,
      activeSuggestionId: null,
      currentTaskMeta: null,
      setResume: (resume) => set({ resume: normalizeResume(resume) }),
      updateResume: (updater) => set((state) => ({ resume: updater(state.resume) })),
      setStyleSettings: (settings) => set((state) => ({ 
        styleSettings: { ...state.styleSettings, ...settings } 
      })),
      resetStyleSettings: () => set({ styleSettings: defaultStyleSettings }),
      setAiEnabled: (aiEnabled) => set({ aiEnabled }),
      setAiSuggestions: (aiSuggestions) => set({ aiSuggestions }),
      setInlineSuggestions: (inlineSuggestions) => set({ inlineSuggestions }),
      setShowSuggestions: (showSuggestions) => set({ showSuggestions }),
      setActiveSuggestion: (activeSuggestionId) => set({ activeSuggestionId }),
      setCurrentTaskMeta: (currentTaskMeta) => set({ currentTaskMeta }),
  applySuggestion: (id) =>
    set((state) => {
      const suggestion = state.inlineSuggestions.find((s) => s.id === id);
      if (!suggestion || suggestion.status !== "pending") return state;

      let newResume = { ...state.resume };

      // Apply the suggestion based on section and type
      if (suggestion.type === "modify" && suggestion.suggestedText) {
        if (suggestion.section === "experience" && suggestion.sectionIndex !== undefined) {
          newResume = {
            ...newResume,
            experience: newResume.experience.map((exp, idx) => {
              if (idx === suggestion.sectionIndex) {
                if (suggestion.field === "bullets" && suggestion.bulletIndex !== undefined) {
                  const newBullets = [...exp.bullets];
                  newBullets[suggestion.bulletIndex] = suggestion.suggestedText!;
                  return { ...exp, bullets: newBullets };
                }
                if (suggestion.field) {
                  return { ...exp, [suggestion.field]: suggestion.suggestedText };
                }
              }
              return exp;
            }),
          };
        } else if (suggestion.section === "project" && suggestion.sectionIndex !== undefined) {
          newResume = {
            ...newResume,
            projects: newResume.projects.map((proj, idx) => {
              if (idx === suggestion.sectionIndex) {
                if (suggestion.field === "bullets" && suggestion.bulletIndex !== undefined) {
                  const newBullets = [...proj.bullets];
                  newBullets[suggestion.bulletIndex] = suggestion.suggestedText!;
                  return { ...proj, bullets: newBullets };
                }
                if (suggestion.field) {
                  return { ...proj, [suggestion.field]: suggestion.suggestedText };
                }
              }
              return proj;
            }),
          };
        } else if (suggestion.section === "summary") {
          newResume = {
            ...newResume,
            basics: {
              ...newResume.basics,
              summary: suggestion.suggestedText,
            },
          };
        } else if (suggestion.section === "skills" && suggestion.sectionIndex !== undefined) {
          newResume = {
            ...newResume,
            skills: newResume.skills.map((category, idx) => {
              if (idx === suggestion.sectionIndex) {
                if (suggestion.bulletIndex !== undefined && suggestion.originalText) {
                  // Replace existing skill
                  const newSkills = [...category.skills];
                  newSkills[suggestion.bulletIndex] = suggestion.suggestedText!;
                  return { ...category, skills: newSkills };
                } else if (!suggestion.originalText || suggestion.originalText === "") {
                  // Add new skill
                  return {
                    ...category,
                    skills: [...category.skills, suggestion.suggestedText!],
                  };
                }
              }
              return category;
            }),
          };
        }
      }

      // Mark suggestion as applied
      const newSuggestions = state.inlineSuggestions.map((s) =>
        s.id === id ? { ...s, status: "applied" as const } : s
      );

      return { resume: newResume, inlineSuggestions: newSuggestions };
    }),
  rejectSuggestion: (id) =>
    set((state) => ({
      inlineSuggestions: state.inlineSuggestions.map((s) =>
        s.id === id ? { ...s, status: "rejected" as const } : s
      ),
    })),
      clearSuggestions: () =>
        set({ aiSuggestions: [], inlineSuggestions: [], showSuggestions: false, activeSuggestionId: null, currentTaskMeta: null }),
    }),
    {
      name: "resume-storage",
      partialize: (state) => ({
        resume: state.resume,
        styleSettings: state.styleSettings,
        inlineSuggestions: state.inlineSuggestions,
        showSuggestions: state.showSuggestions,
        currentTaskMeta: state.currentTaskMeta,
      }),
      // Normalize data when rehydrating from localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.resume) {
          state.resume = normalizeResume(state.resume);
        }
        // Ensure styleSettings has all properties (merge with defaults)
        if (state?.styleSettings) {
          state.styleSettings = { ...defaultStyleSettings, ...state.styleSettings };
        }
      },
    }
  )
);

