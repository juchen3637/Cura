"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
} from "@/lib/hooks/useProfile";
import { useToast } from "@/lib/hooks/useToast";
import Toast from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";

interface ExperienceForm {
  id?: string;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  bullets: string[];
}

export default function ExperiencesPage() {
  const { data: experiences, isLoading } = useExperiences();
  const createExperience = useCreateExperience();
  const updateExperience = useUpdateExperience();
  const deleteExperience = useDeleteExperience();
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
  const [formData, setFormData] = useState<ExperienceForm>({
    company: "",
    role: "",
    location: "",
    start_date: "",
    end_date: "",
    bullets: [""],
  });

  const handleEdit = (exp: any) => {
    setFormData({
      id: exp.id,
      company: exp.company,
      role: exp.role,
      location: exp.location || "",
      start_date: exp.start_date,
      end_date: exp.end_date || "",
      bullets: exp.bullets || [""],
    });
    setEditing(exp.id);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setShowAddForm(false);
    setFormData({
      company: "",
      role: "",
      location: "",
      start_date: "",
      end_date: "",
      bullets: [""],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editing) {
        await updateExperience.mutateAsync({
          id: editing,
          updates: {
            company: formData.company,
            role: formData.role,
            location: formData.location || null,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            bullets: formData.bullets.filter((b) => b.trim()),
          },
        });
      } else {
        await createExperience.mutateAsync({
          company: formData.company,
          role: formData.role,
          location: formData.location || null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          bullets: formData.bullets.filter((b) => b.trim()),
        });
      }
      handleCancel();
      success("Experience saved successfully!");
    } catch (error) {
      showError("Failed to save experience");
    }
  };

  const handleDelete = async (id: string, company: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Experience",
      message: `Are you sure you want to delete your experience at ${company}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteExperience.mutateAsync(id);
          success("Experience deleted successfully!");
        } catch (error) {
          showError("Failed to delete experience");
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
        <p className="text-gray-600">Loading experiences...</p>
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
                Add all your work experiences - AI will pick the best ones for each job
              </p>
            </div>
            {!showAddForm && !editing && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                + Add Experience
              </button>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editing) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Edit Experience" : "Add New Experience"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, State or Remote"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date * (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    placeholder="2020-01"
                    pattern="\d{4}-\d{2}"
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date (YYYY-MM or Present)
                  </label>
                  <input
                    type="text"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    placeholder="2023-06 or Present"
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bullets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Achievements & Responsibilities
                </label>
                <div className="space-y-2">
                  {formData.bullets.map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={bullet}
                        onChange={(e) => updateBullet(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="• Describe your achievement or responsibility..."
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
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add another bullet
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createExperience.isPending || updateExperience.isPending}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {editing ? "Update" : "Add"} Experience
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

        {/* Experiences List */}
        {experiences && experiences.length > 0 ? (
          <div className="space-y-4">
            {experiences.map((exp: any) => (
              <div
                key={exp.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {exp.role}
                    </h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {exp.location} • {exp.start_date} - {exp.end_date || "Present"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(exp)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id, exp.company)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="space-y-1 mt-3">
                    {exp.bullets.map((bullet: string, idx: number) => (
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
              <p className="text-gray-600 mb-4">No experiences added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Add Your First Experience
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
