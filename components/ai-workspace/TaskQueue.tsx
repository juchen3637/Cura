"use client";

import { useState } from "react";
import { AITask } from "@/lib/hooks/useAITaskQueue";

interface TaskQueueProps {
  tasks: AITask[];
  onClearCompleted: () => void;
  onRetryTask: (taskId: string) => void;
}

export default function TaskQueue({ tasks, onClearCompleted, onRetryTask }: TaskQueueProps) {
  const [retryingTasks, setRetryingTasks] = useState<Set<string>>(new Set());

  const handleRetry = async (taskId: string) => {
    setRetryingTasks((prev) => new Set(prev).add(taskId));
    try {
      await onRetryTask(taskId);
    } catch (error) {
      console.error("Failed to retry task:", error);
      alert("Failed to retry task. Please try again.");
    } finally {
      setTimeout(() => {
        setRetryingTasks((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }, 500);
    }
  };

  if (tasks.length === 0) return null;

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const runningTasks = tasks.filter((t) => t.status === "running");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const failedTasks = tasks.filter((t) => t.status === "failed");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Task Queue ({tasks.length})
        </h3>
        {completedTasks.length > 0 && (
          <button
            onClick={onClearCompleted}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Clear Completed
          </button>
        )}
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-lg border ${
              task.status === "running"
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : task.status === "completed"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : task.status === "failed"
                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {task.job_title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    at {task.company}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="capitalize">{task.mode}</span>
                  {task.status === "running" && (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 text-blue-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-blue-700 dark:text-blue-400">Processing...</span>
                    </div>
                  )}
                  {task.status === "completed" && (
                    <span className="text-green-700 dark:text-green-400">✓ Completed</span>
                  )}
                  {task.status === "failed" && (
                    <span className="text-red-700 dark:text-red-400">✗ Failed</span>
                  )}
                  {task.status === "pending" && (
                    <span className="text-gray-500 dark:text-gray-400">⏱ Queued</span>
                  )}
                </div>
                {task.error && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{task.error}</p>
                )}
                {task.status === "failed" && (
                  <button
                    onClick={() => handleRetry(task.id)}
                    disabled={retryingTasks.has(task.id)}
                    className="mt-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {retryingTasks.has(task.id) ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Retrying...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Retry
                      </>
                    )}
                  </button>
                )}
              </div>
              {task.status === "completed" && task.result && (
                <button
                  onClick={() => task.onComplete?.(task.result)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  View Result
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Queue Status */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Queued</p>
            <p className="font-semibold text-gray-900 dark:text-white">{pendingTasks.length}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Running</p>
            <p className="font-semibold text-blue-700 dark:text-blue-400">{runningTasks.length}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Completed</p>
            <p className="font-semibold text-green-700 dark:text-green-400">{completedTasks.length}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Failed</p>
            <p className="font-semibold text-red-700 dark:text-red-400">{failedTasks.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
