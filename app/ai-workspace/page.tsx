"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnalyzeMode from "@/components/ai-workspace/AnalyzeMode";
import BuildCuratedMode from "@/components/ai-workspace/BuildCuratedMode";
import ModeSelector from "@/components/ai-workspace/ModeSelector";
import OutreachPanel from "@/components/ai-workspace/OutreachPanel";
import CoverLetterPanel from "@/components/ai-workspace/CoverLetterPanel";
import JobContextPanel from "@/components/ai-workspace/JobContextPanel";
import TaskQueueSidePanel from "@/components/ai-workspace/TaskQueueSidePanel";
import { useAITaskQueue } from "@/lib/hooks/useAITaskQueue";
import { useResumeStore } from "@/store/resumeStore";
import { useJobContextStore } from "@/store/jobContextStore";

type PipelineTab = "context" | "resume" | "outreach" | "cover-letter";

const TABS: { id: PipelineTab; label: string; description: string }[] = [
  { id: "context", label: "1. Job Context", description: "Enter job details once" },
  { id: "resume", label: "2. Resume AI", description: "Analyze or build a resume" },
  { id: "outreach", label: "3. Outreach", description: "Draft a personalized message" },
  { id: "cover-letter", label: "4. Cover Letter", description: "Generate a cover letter" },
];

export default function AIWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <AIWorkspace />
    </Suspense>
  );
}

function AIWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setResume, setInlineSuggestions, setShowSuggestions, setCurrentTaskMeta } = useResumeStore();
  const { jobDescription } = useJobContextStore();
  const { tasks, addTask, clearCompleted, removeTask, retryTask } = useAITaskQueue();

  const [activeTab, setActiveTab] = useState<PipelineTab>(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "analyze" || tabParam === "build") return "resume";
    if (tabParam && TABS.some((t) => t.id === tabParam)) return tabParam as PipelineTab;
    return "resume";
  });

  const [resumeMode, setResumeMode] = useState<"analyze" | "build">(() => {
    return searchParams.get("tab") === "build" ? "build" : "analyze";
  });

  const [queueOpen, setQueueOpen] = useState(false);

  const handleViewResult = (task: any) => {
    setCurrentTaskMeta({
      jobTitle: task.job_title || "",
      company: task.company || "",
    });

    if (task.mode === "build" && task.result) {
      setResume(task.result.resume);
      setInlineSuggestions(task.result.inlineSuggestions || []);
      setShowSuggestions(task.result.inlineSuggestions?.length > 0);
      setTimeout(() => router.push("/resume-editor"), 100);
    } else if (task.mode === "analyze" && task.result) {
      if (task.result.changes && task.result.changes.length > 0) {
        const inlineSuggestions = task.result.changes.map((change: any, index: number) => {
          let normalizedSection = change.section.toLowerCase();
          if (normalizedSection === "projects") normalizedSection = "project";
          if (normalizedSection === "experiences") normalizedSection = "experience";
          const keywordsInfo = change.keywordsAdded?.length > 0
            ? ` (Keywords: ${change.keywordsAdded.join(", ")})`
            : "";
          return {
            id: `change-${index}-${Date.now()}`,
            type: "modify" as const,
            section: normalizedSection as any,
            sectionIndex: change.sectionIndex,
            field: change.field,
            bulletIndex: change.bulletIndex,
            originalText: change.currentText?.trim(),
            suggestedText: change.suggestedText?.trim(),
            title: `${normalizedSection.charAt(0).toUpperCase() + normalizedSection.slice(1)} - ${change.field}`,
            description: change.reason + keywordsInfo,
            reasoning: change.reason + keywordsInfo,
            keywordsAdded: change.keywordsAdded || [],
            status: "pending" as const,
            highlightColor: "blue" as const,
          };
        });
        setInlineSuggestions(inlineSuggestions);
        setShowSuggestions(true);
      }

      const loadResumeAndNavigate = async () => {
        if (task.resume_data) {
          if (task.resume_data.content) {
            try {
              setResume(JSON.parse(task.resume_data.content));
            } catch (e) {
              console.error("Failed to parse resume content:", e);
            }
          } else if (task.resume_data.base64Data) {
            try {
              const res = await fetch("/api/parse-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  pdfData: task.resume_data.base64Data,
                  mediaType: task.resume_data.mediaType || "application/pdf",
                }),
              });
              if (!res.ok) throw new Error(`Parse failed: ${res.status}`);
              setResume(await res.json());
            } catch (e) {
              console.error("Failed to re-parse PDF:", e);
            }
          }
        }
        setTimeout(() => router.push("/resume-editor"), 100);
      };

      loadResumeAndNavigate();
    }
  };

  const enhancedAddTask = async (
    mode: "analyze" | "build",
    jobDesc: string,
    jobTitle?: string,
    company?: string,
    resumeData?: string,
    preferences?: { maxBulletsPerExperience?: number; maxBulletsPerProject?: number }
  ) => {
    return addTask(mode, jobDesc, jobTitle, company, resumeData, undefined, preferences);
  };

  const handleTabChange = (tab: PipelineTab) => {
    setActiveTab(tab);
    router.replace(`/ai-workspace?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Task Queue Side Panel */}
      <TaskQueueSidePanel
        tasks={tasks.map((t) => ({ ...t, onComplete: () => handleViewResult(t) }))}
        isOpen={queueOpen}
        onToggle={() => setQueueOpen(!queueOpen)}
        onClearCompleted={clearCompleted}
        onDeleteTask={removeTask}
        onRetryTask={retryTask}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Pipeline</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Enter the job once — optimize your resume, draft outreach, and generate a cover letter.
          </p>
        </div>

        {/* Pipeline Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-max px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                } ${
                  tab.id !== "context" && !jobDescription.trim() ? "opacity-60" : ""
                }`}
              >
                <span className="block">{tab.label}</span>
                <span className="block text-xs font-normal opacity-70 mt-0.5 hidden sm:block">
                  {tab.description}
                </span>
              </button>
            ))}
          </div>

          {/* Context status indicator */}
          {jobDescription.trim() && activeTab !== "context" && (
            <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Job context loaded — all tools will use your job description
              <button
                onClick={() => handleTabChange("context")}
                className="ml-2 underline hover:no-underline"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "context" && <JobContextPanel />}

          {activeTab === "resume" && (
            <div className="space-y-6">
              <ModeSelector mode={resumeMode} onChange={setResumeMode} />
              {resumeMode === "analyze" ? (
                <AnalyzeMode addTask={enhancedAddTask} />
              ) : (
                <BuildCuratedMode addTask={enhancedAddTask} />
              )}
            </div>
          )}

          {activeTab === "outreach" && <OutreachPanel />}

          {activeTab === "cover-letter" && <CoverLetterPanel />}
        </div>
      </div>
    </div>
  );
}
