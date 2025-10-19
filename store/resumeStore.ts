import { create } from "zustand";
import { Resume } from "@/types/resume";

interface ResumeState {
  resume: Resume;
  aiEnabled: boolean;
  setResume: (resume: Resume) => void;
  updateResume: (updater: (resume: Resume) => Resume) => void;
  setAiEnabled: (enabled: boolean) => void;
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

export const useResumeStore = create<ResumeState>((set) => ({
  resume: defaultResume,
  aiEnabled: false,
  setResume: (resume) => set({ resume }),
  updateResume: (updater) => set((state) => ({ resume: updater(state.resume) })),
  setAiEnabled: (aiEnabled) => set({ aiEnabled }),
}));

