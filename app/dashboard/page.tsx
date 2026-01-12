"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useResumes, useDeleteResume, useDuplicateResume } from "@/lib/hooks/useResumes";
import { useResumeStore } from "@/store/resumeStore";
import { useToast } from "@/lib/hooks/useToast";
import Toast from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DashboardPage() {
  const router = useRouter();
  const { data: resumes, isLoading, error } = useResumes();
  const deleteResume = useDeleteResume();
  const duplicateResume = useDuplicateResume();
  const { setResume } = useResumeStore();
  const { toast, hideToast, success, error: showError } = useToast();

  const [uploading, setUploading] = useState(false);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleDelete = async (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Resume",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteResume.mutateAsync(id);
          success("Resume deleted successfully!");
        } catch (error) {
          showError("Failed to delete resume");
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newResume = await duplicateResume.mutateAsync(id);
      success("Resume duplicated successfully!");
    } catch (error) {
      showError("Failed to duplicate resume");
    }
  };

  const handleEditTitle = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitle(id);
    setNewTitle(currentTitle);
  };

  const handleSaveTitle = async (id: string) => {
    if (!newTitle.trim()) {
      showError("Title cannot be empty");
      return;
    }

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      });

      if (!response.ok) throw new Error("Failed to update title");

      success("Title updated successfully!");
      // Refresh the list
      window.location.reload();
    } catch (error) {
      showError("Failed to update resume title");
    } finally {
      setEditingTitle(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTitle(null);
    setNewTitle("");
  };

  const handleCreateNew = () => {
    // Reset resume store to default
    setResume({
      version: "1.0",
      basics: {
        name: "",
        title: "",
        location: "",
        contact: { email: "", phone: "", links: [] },
        summary: "",
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
    });
    router.push("/resume-editor");
  };

  const handleUploadPdf = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showError("Please upload a PDF file.");
      return;
    }

    setUploading(true);

    try {
      // Convert PDF to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Send to API for parsing
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfData: base64Data,
          mediaType: "application/pdf",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse PDF");
      }

      const parsedResume = await response.json();

      // Save to database
      const saveResponse = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: parsedResume.basics.name || "Untitled Resume",
          resume_data: parsedResume,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save resume");
      }

      const savedResume = await saveResponse.json();

      // Load into editor
      setResume(parsedResume);

      success("Resume imported and saved successfully! Opening editor...");
      router.push(`/resume-editor?resumeId=${savedResume.id}`);
    } catch (error) {
      console.error("Import error:", error);
      showError("Failed to import resume from PDF. Please try again.");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
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
          <p className="text-gray-600">Loading your resumes...</p>
          <p className="text-xs text-gray-400 mt-2">Check browser console if this takes too long</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-sm text-red-700 mb-4">
            {error instanceof Error ? error.message : "Failed to load resumes"}
          </p>
          <p className="text-xs text-gray-600 mb-4">Check browser console for details</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-gray-600">
                Manage your resumes and create new ones
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/profile"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Manage Profile
              </Link>
              <button
                onClick={handleUploadPdf}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-purple-600 rounded-lg text-sm font-medium text-purple-600 bg-white hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Resume PDF
                  </>
                )}
              </button>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Resume
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resume Grid */}
          <div className={`${previewResume ? "lg:col-span-1" : "lg:col-span-3"}`}>
            {!resumes || resumes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No resumes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first resume or building one from your profile
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create New Resume
              </button>
              <Link
                href="/ai-workspace"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Build with AI
              </Link>
            </div>
          </div>
            ) : (
              <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-4">
                {resumes.map((resume: any) => (
                  <div
                    key={resume.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer ${
                      previewResume?.id === resume.id
                        ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    onClick={() => setPreviewResume(resume)}
                  >
                {/* Resume Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {editingTitle === resume.id ? (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="flex-1 px-2 py-1 border border-blue-500 dark:bg-gray-700 dark:text-white dark:border-blue-400 rounded text-sm"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleSaveTitle(resume.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={() => handleSaveTitle(resume.id)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {resume.title}
                        </h3>
                        <button
                          onClick={(e) => handleEditTitle(resume.id, resume.title, e)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit title"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Updated {new Date(resume.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  {resume.is_favorite && (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </div>

                {/* Resume Info */}
                {resume.job_description && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 line-clamp-2">
                      {resume.job_description.substring(0, 100)}...
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/resume-editor?resumeId=${resume.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-3 py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(resume.id);
                    }}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Duplicate"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(resume.id, resume.title);
                    }}
                    className="px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {previewResume && (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
                <button
                  onClick={() => setPreviewResume(null)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Resume Preview */}
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg overflow-auto max-h-[800px]">
                <div className="bg-white p-10 shadow-sm max-w-[8.5in] mx-auto">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold mb-1">{previewResume.resume_data.basics.name}</h1>
                    <p className="text-lg italic mb-2">{previewResume.resume_data.basics.title}</p>
                    <p className="text-sm">{previewResume.resume_data.basics.location}</p>
                    <p className="text-sm">
                      {previewResume.resume_data.basics.contact.phone} | {previewResume.resume_data.basics.contact.email}
                      {previewResume.resume_data.basics.contact.links.map((link: any, idx: number) => {
                        // Handle both old string format and new object format
                        const linkUrl = typeof link === 'string' ? link : link?.url || '';
                        const displayName = typeof link === 'string' ? link : (link?.displayName || link?.url || '');
                        return <span key={idx}> | {displayName}</span>;
                      })}
                    </p>
                  </div>

                  {/* Summary */}
                  {previewResume.resume_data.basics.summary && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase mb-2 border-b border-black">Summary</h2>
                      <p className="text-sm">{previewResume.resume_data.basics.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {previewResume.resume_data.experience.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase mb-3 border-b border-black">Experience</h2>
                      {previewResume.resume_data.experience.map((exp: any, idx: number) => (
                        <div key={idx} className="mb-4">
                          <div className="flex justify-between items-baseline mb-1">
                            <p className="font-bold">{exp.company}</p>
                            <p className="text-sm">{exp.start} - {exp.end}</p>
                          </div>
                          <p className="italic text-sm mb-2">{exp.role}</p>
                          <ul className="list-disc list-inside space-y-1">
                            {exp.bullets.map((bullet: string, bIdx: number) => (
                              <li key={bIdx} className="text-sm">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {previewResume.resume_data.projects.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase mb-3 border-b border-black">Projects</h2>
                      {previewResume.resume_data.projects.map((proj: any, idx: number) => (
                        <div key={idx} className="mb-3">
                          <p className="font-bold">{proj.name}</p>
                          <ul className="list-disc list-inside space-y-1">
                            {proj.bullets.map((bullet: string, bIdx: number) => (
                              <li key={bIdx} className="text-sm">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {previewResume.resume_data.education.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase mb-3 border-b border-black">Education</h2>
                      {previewResume.resume_data.education.map((edu: any, idx: number) => (
                        <div key={idx} className="mb-2">
                          <div className="flex justify-between items-baseline">
                            <p className="font-bold">{edu.institution}</p>
                            <p className="text-sm">{edu.end}</p>
                          </div>
                          <p className="italic text-sm">{edu.degree}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {previewResume.resume_data.skills.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase mb-3 border-b border-black">Skills</h2>
                      {previewResume.resume_data.skills.map((category: any, idx: number) => (
                        <p key={idx} className="text-sm mb-1">
                          <span className="font-semibold">{category.name}:</span> {category.skills.join(", ")}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        variant="danger"
      />
    </div>
  );
}
