"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useEducation,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
} from "@/lib/hooks/useProfile";
import { useToast } from "@/lib/hooks/useToast";
import Toast from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";

interface EducationForm {
  id?: string;
  institution: string;
  degree: string;
  location: string;
  start_date: string;
  end_date: string;
}

export default function EducationPage() {
  const { data: education, isLoading } = useEducation();
  const createEducation = useCreateEducation();
  const updateEducation = useUpdateEducation();
  const deleteEducation = useDeleteEducation();
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
  const [formData, setFormData] = useState<EducationForm>({
    institution: "",
    degree: "",
    location: "",
    start_date: "",
    end_date: "",
  });

  const handleEdit = (edu: any) => {
    setFormData({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      location: edu.location || "",
      start_date: edu.start_date || "",
      end_date: edu.end_date || "",
    });
    setEditing(edu.id);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setShowAddForm(false);
    setFormData({
      institution: "",
      degree: "",
      location: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editing) {
        await updateEducation.mutateAsync({
          id: editing,
          updates: {
            institution: formData.institution,
            degree: formData.degree,
            location: formData.location || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
          },
        });
      } else {
        await createEducation.mutateAsync({
          institution: formData.institution,
          degree: formData.degree,
          location: formData.location || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        });
      }
      handleCancel();
      success("Education saved successfully!");
    } catch (error) {
      showError("Failed to save education");
    }
  };

  const handleDelete = async (id: string, institution: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Education",
      message: `Are you sure you want to delete ${institution}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteEducation.mutateAsync(id);
          success("Education deleted successfully!");
        } catch (error) {
          showError("Failed to delete education");
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading education...</p>
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
                Add your degrees, certifications, and educational background
              </p>
            </div>
            {!showAddForm && !editing && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                + Add Education
              </button>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editing) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Edit Education" : "Add New Education"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Institution *
                </label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="University of California, Berkeley"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Degree *
                </label>
                <input
                  type="text"
                  required
                  value={formData.degree}
                  onChange={(e) =>
                    setFormData({ ...formData, degree: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Bachelor of Science in Computer Science"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Berkeley, CA"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date (YYYY or YYYY-MM)
                  </label>
                  <input
                    type="text"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    placeholder="2016 or 2016-09"
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date (YYYY or YYYY-MM)
                  </label>
                  <input
                    type="text"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    placeholder="2020 or 2020-05"
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createEducation.isPending || updateEducation.isPending}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {editing ? "Update" : "Add"} Education
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

        {/* Education List */}
        {education && education.length > 0 ? (
          <div className="space-y-4">
            {education.map((edu: any) => (
              <div
                key={edu.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {edu.degree}
                    </h3>
                    <p className="text-green-600 font-medium">{edu.institution}</p>
                    <p className="text-sm text-gray-500">
                      {edu.location && `${edu.location} • `}
                      {edu.start_date && edu.end_date
                        ? `${edu.start_date} - ${edu.end_date}`
                        : edu.end_date || ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(edu)}
                      className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(edu.id, edu.institution)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showAddForm && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">No education added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Add Your First Education
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
