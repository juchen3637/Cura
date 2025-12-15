"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/lib/hooks/useProfile";
import { useToast } from "@/lib/hooks/useToast";
import Toast from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";

interface ProjectForm {
  id?: string;
  name: string;
  link: string;
  bullets: string[];
  tags: string[];
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast, hideToast, success, error: showError } = useToast();

  const [editing, setEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
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
  const [formData, setFormData] = useState<ProjectForm>({
    name: "",
    link: "",
    bullets: [""],
    tags: [],
  });

  const handleEdit = (proj: any) => {
    setFormData({
      id: proj.id,
      name: proj.name,
      link: proj.link || "",
      bullets: proj.bullets || [""],
      tags: proj.tags || [],
    });
    setEditing(proj.id);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setShowAddForm(false);
    setFormData({
      name: "",
      link: "",
      bullets: [""],
      tags: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editing) {
        await updateProject.mutateAsync({
          id: editing,
          updates: {
            name: formData.name,
            link: formData.link || null,
            bullets: formData.bullets.filter((b) => b.trim()),
            tags: formData.tags,
          },
        });
      } else {
        await createProject.mutateAsync({
          name: formData.name,
          link: formData.link || null,
          bullets: formData.bullets.filter((b) => b.trim()),
          tags: formData.tags,
        });
      }
      handleCancel();
      success("Project saved successfully!");
    } catch (error) {
      showError("Failed to save project");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Project",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteProject.mutateAsync(id);
          success("Project deleted successfully!");
        } catch (error) {
          showError("Failed to delete project");
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const addBullet = () => {
    setFormData({ ...formData, bullets: [...formData.bullets, ""] });
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...formData.bullets];
    newBullets[index] = value;
    setFormData({ ...formData, bullets: newBullets });
  };

  const removeBullet = (index: number) => {
    const newBullets = formData.bullets.filter((_, i) => i !== index);
    setFormData({ ...formData, bullets: newBullets });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/profile"
                className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
              >
                ← Back to Profile
              </Link>
              <p className="text-gray-600">
                Showcase your personal and professional projects
              </p>
            </div>
            {!showAddForm && !editing && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                + Add Project
              </button>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editing) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Edit Project" : "Add New Project"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="E-commerce Platform"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://github.com/username/project"
                />
              </div>

              {/* Bullets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description & Achievements
                </label>
                <div className="space-y-2">
                  {formData.bullets.map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={bullet}
                        onChange={(e) => updateBullet(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="• Built with React and Node.js, serving 10k+ users"
                      />
                      {formData.bullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBullet(index)}
                          className="px-2 text-red-600 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBullet}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add another bullet
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createProject.isPending || updateProject.isPending}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                >
                  {editing ? "Update" : "Add"} Project
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        {projects && projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((proj: any) => (
              <div
                key={proj.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {proj.name}
                    </h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        {proj.link} ↗
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(proj)}
                      className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id, proj.name)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="space-y-1">
                    {proj.bullets.map((bullet: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showAddForm && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">No projects added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Add Your First Project
              </button>
            </div>
          )
        )}
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
