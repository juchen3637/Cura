"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModeSelector from "@/components/ai-workspace/ModeSelector";
import AnalyzeMode from "@/components/ai-workspace/AnalyzeMode";
import BuildCuratedMode from "@/components/ai-workspace/BuildCuratedMode";
import TaskQueueSidePanel from "@/components/ai-workspace/TaskQueueSidePanel";
import { useAITaskQueue } from "@/lib/hooks/useAITaskQueue";
import { useResumeStore } from "@/store/resumeStore";

export default function AIWorkspace() {
  const [mode, setMode] = useState<"analyze" | "build">("build");
  const [queueOpen, setQueueOpen] = useState(false);
  const router = useRouter();
  const { setResume, setInlineSuggestions, setShowSuggestions, setCurrentTaskMeta } = useResumeStore();
  const { tasks, addTask, clearCompleted, removeTask, retryTask } = useAITaskQueue();

  const handleViewResult = (task: any) => {
    // Store task metadata for auto-naming when saving
    setCurrentTaskMeta({
      jobTitle: task.job_title || "",
      company: task.company || "",
    });

    if (task.mode === "build" && task.result) {
      // Load curated resume into editor
      console.log("Loading resume from completed task:", task.result.resume);
      setResume(task.result.resume);
      setInlineSuggestions(task.result.inlineSuggestions || []);
      setShowSuggestions(task.result.inlineSuggestions?.length > 0);

      setTimeout(() => {
        router.push("/resume-editor");
      }, 100);
    } else if (task.mode === "analyze" && task.result) {
      // Load suggestions into editor first
      if (task.result.changes && task.result.changes.length > 0) {
        const inlineSuggestions = task.result.changes.map((change: any, index: number) => {
          let normalizedSection = change.section.toLowerCase();
          if (normalizedSection === "projects") normalizedSection = "project";
          if (normalizedSection === "experiences") normalizedSection = "experience";

          // Include keywords added info in the reasoning
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

      // Load the original resume that was analyzed and then navigate
      const loadResumeAndNavigate = async () => {
        if (task.resume_data) {
          // If resume_data has content (JSON string from saved resume), parse and load it
          if (task.resume_data.content) {
            try {
              const resumeContent = JSON.parse(task.resume_data.content);
              console.log("Loading resume from task content:", resumeContent);
              setResume(resumeContent);
            } catch (e) {
              console.error("Failed to parse resume content:", e);
            }
          } else if (task.resume_data.base64Data) {
            // For PDFs, we need to re-parse the document
            console.log("Resume was a PDF - attempting to re-parse");
            try {
              const res = await fetch("/api/parse-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  pdfData: task.resume_data.base64Data,
                  mediaType: task.resume_data.mediaType || "application/pdf",
                }),
              });
              const parsedResume = await res.json();
              console.log("Re-parsed PDF resume:", parsedResume);
              setResume(parsedResume);
            } catch (e) {
              console.error("Failed to re-parse PDF:", e);
            }
          }
        }

        // Navigate after resume is loaded
        setTimeout(() => {
          router.push("/resume-editor");
        }, 100);
      };

      loadResumeAndNavigate();
    }
  };

  // Add onComplete handlers to tasks
  const enhancedAddTask = async (
    mode: "analyze" | "build",
    jobDescription: string,
    jobTitle?: string,
    company?: string,
    resumeData?: string
  ) => {
    const taskId = await addTask(mode, jobDescription, jobTitle, company, resumeData, (result) => {
      // Task completed - result is available in the queue for user to view
      console.log(`Task completed: ${mode}`, result);
    });
    return taskId;
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
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Choose how you want to work with AI to optimize your job application
          </p>

          {/* Mode Selector */}
          <ModeSelector mode={mode} onChange={setMode} />
        </div>

        {/* Mode Description */}
        <div className="mb-8">
          {mode === "analyze" ? (
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
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Analyze Existing Resume
                  </h3>
                  <p className="text-sm text-blue-800">
                    Upload your current resume and job description. The AI will analyze how
                    well they match and suggest specific improvements to strengthen your
                    application.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5 mr-3"
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
                  <h3 className="text-sm font-semibold text-purple-900 mb-1">
                    Build Curated Resume
                  </h3>
                  <p className="text-sm text-purple-800">
                    Paste a job description and let AI build an optimized resume from your
                    profile. It selects the most relevant experiences, projects, and skills,
                    then tailors the content to match the job requirements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode Content */}
        {mode === "analyze" ? <AnalyzeMode addTask={enhancedAddTask} /> : <BuildCuratedMode addTask={enhancedAddTask} />}
      </div>
    </div>
  );
}
