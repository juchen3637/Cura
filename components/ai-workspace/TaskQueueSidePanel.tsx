"use client";

import { AITask } from "@/lib/hooks/useAITaskQueue";

interface TaskQueueSidePanelProps {
  tasks: AITask[];
  isOpen: boolean;
  onToggle: () => void;
  onClearCompleted: () => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskQueueSidePanel({
  tasks,
  isOpen,
  onToggle,
  onClearCompleted,
  onDeleteTask,
}: TaskQueueSidePanelProps) {
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const runningTasks = tasks.filter((t) => t.status === "running");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const failedTasks = tasks.filter((t) => t.status === "failed");

  return (
    <>
      {/* Toggle Button - Only show when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-4 top-20 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg z-40 transition-all print:hidden flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-sm font-semibold">
            Queue {tasks.length > 0 && `(${tasks.length})`}
          </span>
        </button>
      )}

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-16 bottom-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-30 transform transition-transform duration-300 print:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Queue</h2>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Queue Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Queued</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingTasks.length}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-700 dark:text-blue-400">Running</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{runningTasks.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
              <p className="text-xs text-green-700 dark:text-green-400">Completed</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{completedTasks.length}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 text-center">
              <p className="text-xs text-red-700 dark:text-red-400">Failed</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{failedTasks.length}</p>
            </div>
          </div>

          {/* Clear Completed Button */}
          {completedTasks.length > 0 && (
            <button
              onClick={onClearCompleted}
              className="w-full mb-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Clear Completed Tasks
            </button>
          )}

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No tasks in queue</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add a task to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border transition-colors relative group ${
                    task.status === "running"
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : task.status === "completed"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : task.status === "failed"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {task.job_title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {task.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          task.mode === "build"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                            : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {task.mode === "build" ? "Build" : "Analyze"}
                      </span>
                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          if (task.status === "running") {
                            if (!confirm("This task is currently running. Are you sure you want to cancel it?")) {
                              return;
                            }
                          }
                          onDeleteTask(task.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Status Row */}

                  <div className="flex items-center gap-2 text-sm">
                    {task.status === "running" && (
                      <div className="flex items-center text-blue-700 dark:text-blue-400">
                        <svg
                          className="animate-spin h-4 w-4 mr-1"
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
                        Processing...
                      </div>
                    )}
                    {task.status === "completed" && (
                      <>
                        <span className="text-green-700 dark:text-green-400 flex-shrink-0">✓ Completed</span>
                        <button
                          onClick={() => task.onComplete?.(task.result)}
                          className="ml-auto px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
                        >
                          View
                        </button>
                      </>
                    )}
                    {task.status === "failed" && (
                      <span className="text-red-700 dark:text-red-400 text-xs">✗ {task.error || "Failed"}</span>
                    )}
                    {task.status === "pending" && (
                      <span className="text-gray-500 dark:text-gray-400">⏱ Queued</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-20 print:hidden"
          onClick={onToggle}
        ></div>
      )}
    </>
  );
}
