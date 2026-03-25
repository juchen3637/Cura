import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface JobContextState {
  jobDescription: string;
  jobTitle: string;
  company: string;
  selectedResumeId: string;
  setJobDescription: (value: string) => void;
  setJobTitle: (value: string) => void;
  setCompany: (value: string) => void;
  setSelectedResumeId: (value: string) => void;
  reset: () => void;
}

const initialState = {
  jobDescription: "",
  jobTitle: "",
  company: "",
  selectedResumeId: "",
};

export const useJobContextStore = create<JobContextState>()(
  persist(
    (set) => ({
      ...initialState,
      setJobDescription: (value) => set({ jobDescription: value }),
      setJobTitle: (value) => set({ jobTitle: value }),
      setCompany: (value) => set({ company: value }),
      setSelectedResumeId: (value) => set({ selectedResumeId: value }),
      reset: () => set(initialState),
    }),
    {
      name: "cura-job-context",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
