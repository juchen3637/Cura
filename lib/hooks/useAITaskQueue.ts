import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type AITaskMode = "analyze" | "build";
export type AITaskStatus = "pending" | "running" | "completed" | "failed";

export interface BuildPreferences {
  maxExperiences?: number;
  maxProjects?: number;
  maxBulletsPerExperience?: number;
  maxBulletsPerProject?: number;
}

export interface AITask {
  id: string;
  mode: AITaskMode;
  job_title: string;
  company: string;
  job_description: string;
  resume_data?: any;
  preferences?: BuildPreferences;
  status: AITaskStatus;
  result?: any;
  error?: string | null;
  created_at: string;
  completed_at?: string | null;
  onComplete?: (result: any) => void;
}

export function useAITaskQueue() {
  const queryClient = useQueryClient();
  const [dbAvailable, setDbAvailable] = useState(true);
  const processingTasksRef = useRef(new Set<string>());

  // Fetch tasks from database
  const { data: tasks = [], refetch } = useQuery<AITask[]>({
    queryKey: ["ai-tasks"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/ai-tasks");
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to fetch tasks:", response.status, errorText);

          // Mark DB as unavailable on error
          setDbAvailable(false);
          return [];
        }
        setDbAvailable(true);
        return response.json();
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setDbAvailable(false);
        return [];
      }
    },
    refetchInterval: dbAvailable ? 3000 : false, // Poll every 3 seconds if available
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: {
      mode: AITaskMode;
      job_title: string;
      company: string;
      job_description: string;
      resume_data?: any;
      preferences?: BuildPreferences;
    }) => {
      const response = await fetch("/api/ai-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create task:", errorData);
        throw new Error(errorData.error || "Failed to create task");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-tasks"] });
    },
    onError: (error) => {
      console.error("Create task mutation error:", error);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await fetch(`/api/ai-tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-tasks"] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/ai-tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-tasks"] });
    },
  });

  const addTask = useCallback(
    async (
      mode: AITaskMode,
      jobDescription: string,
      jobTitle?: string,
      company?: string,
      resumeData?: string,
      onComplete?: (result: any) => void,
      preferences?: BuildPreferences
    ) => {
      if (!dbAvailable) {
        throw new Error("Database not available. Please run the migration first.");
      }

      // Calculate next task number based on existing tasks that start with "Task"
      let nextTaskNumber = 1;
      if (tasks && tasks.length > 0) {
        const taskNumbers = tasks
          .map((t) => {
            const match = t.job_title.match(/^Task (\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((n) => n > 0);

        if (taskNumbers.length > 0) {
          nextTaskNumber = Math.max(...taskNumbers) + 1;
        }
      }

      const displayTitle = jobTitle?.trim() || `Task ${nextTaskNumber}`;
      const displayCompany = company?.trim() || "No Company";

      const taskData = {
        mode,
        job_title: displayTitle,
        company: displayCompany,
        job_description: jobDescription,
        resume_data: resumeData ? JSON.parse(resumeData) : null,
        preferences: preferences || undefined,
      };

      const newTask = await createTaskMutation.mutateAsync(taskData);

      return newTask.id;
    },
    [tasks, createTaskMutation, dbAvailable]
  );

  const clearCompleted = useCallback(async () => {
    const completedTasks = tasks.filter((t) => t.status === "completed");
    await Promise.all(
      completedTasks.map((t) => deleteTaskMutation.mutateAsync(t.id))
    );
  }, [tasks, deleteTaskMutation]);

  const removeTask = useCallback(
    async (taskId: string) => {
      await deleteTaskMutation.mutateAsync(taskId);
    },
    [deleteTaskMutation]
  );

  // Process all pending tasks in parallel
  useEffect(() => {
    if (!dbAvailable) return;
    if (!tasks || tasks.length === 0) return;

    const processTask = async (task: AITask) => {
      // Prevent duplicate processing using ref
      if (processingTasksRef.current.has(task.id)) return;
      processingTasksRef.current.add(task.id);

      try {
        // Update task to running
        await updateTaskMutation.mutateAsync({
          id: task.id,
          updates: { status: "running" },
        });
      } catch (error) {
        console.error("Failed to update task status:", error);
        processingTasksRef.current.delete(task.id);
        return;
      }

      try {
        let result;

        // Check rate limit before processing
        const apiType = task.mode === "analyze" ? "ai_analyze" : "ai_build";
        const rateLimitResponse = await fetch("/api/rate-limit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiType }),
        });

        if (!rateLimitResponse.ok) {
          if (rateLimitResponse.status === 429) {
            throw new Error("AI usage limit reached for this month. Please try again next month.");
          }
          throw new Error("Rate limit check failed");
        }

        if (task.mode === "analyze") {
          const response = await fetch("/api/analyze-application", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume: task.resume_data,
              coverLetter: null,
              jobDescription: task.job_description,
            }),
          });

          if (!response.ok) throw new Error("Failed to analyze");
          result = await response.json();
        } else {
          // Build mode
          const response = await fetch("/api/ai/build-curated-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobDescription: task.job_description,
              preferences: {
                maxExperiences: task.preferences?.maxExperiences || 3,
                maxProjects: task.preferences?.maxProjects || 2,
                maxBulletsPerExperience: task.preferences?.maxBulletsPerExperience || 3,
                maxBulletsPerProject: task.preferences?.maxBulletsPerProject || 3,
              },
            }),
          });

          if (!response.ok) throw new Error("Failed to build resume");
          result = await response.json();
        }

        // Mark as completed
        await updateTaskMutation.mutateAsync({
          id: task.id,
          updates: {
            status: "completed",
            result,
            completed_at: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("Task processing error:", error);
        // Mark as failed
        try {
          await updateTaskMutation.mutateAsync({
            id: task.id,
            updates: {
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
            },
          });
        } catch (updateError) {
          console.error("Failed to mark task as failed:", updateError);
        }
      }
    };

    // Process all pending tasks in parallel (but only once per task)
    const pendingTasks = tasks.filter((t) => t.status === "pending");
    pendingTasks.forEach((task) => {
      processTask(task);
    });
  }, [tasks, updateTaskMutation, dbAvailable]);

  return {
    tasks,
    addTask,
    clearCompleted,
    removeTask,
  };
}
