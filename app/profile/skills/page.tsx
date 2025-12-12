"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useSkillCategories,
  useCreateSkillCategory,
  useUpdateSkillCategory,
  useDeleteSkillCategory,
} from "@/lib/hooks/useProfile";

interface SkillCategoryForm {
  id?: string;
  name: string;
  skills: string[];
  skillInput: string;
}

export default function SkillsPage() {
  const { data: skillCategories, isLoading } = useSkillCategories();
  const createSkillCategory = useCreateSkillCategory();
  const updateSkillCategory = useUpdateSkillCategory();
  const deleteSkillCategory = useDeleteSkillCategory();

  const [editing, setEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<SkillCategoryForm>({
    name: "",
    skills: [],
    skillInput: "",
  });

  const handleEdit = (cat: any) => {
    setFormData({
      id: cat.id,
      name: cat.name,
      skills: cat.skills || [],
      skillInput: "",
    });
    setEditing(cat.id);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setShowAddForm(false);
    setFormData({
      name: "",
      skills: [],
      skillInput: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editing) {
        await updateSkillCategory.mutateAsync({
          id: editing,
          updates: {
            name: formData.name,
            skills: formData.skills,
          },
        });
      } else {
        await createSkillCategory.mutateAsync({
          name: formData.name,
          skills: formData.skills,
        });
      }
      handleCancel();
    } catch (error) {
      alert("Failed to save skill category");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete "${name}" category?`)) {
      try {
        await deleteSkillCategory.mutateAsync(id);
      } catch (error) {
        alert("Failed to delete skill category");
      }
    }
  };

  const addSkill = () => {
    if (formData.skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.skillInput.trim()],
        skillInput: "",
      });
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading skills...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                Organize your skills into categories like Languages, Frameworks, Tools
              </p>
            </div>
            {!showAddForm && !editing && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                + Add Category
              </button>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editing) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Edit Skill Category" : "Add New Skill Category"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Programming Languages, Frameworks, Tools"
                />
              </div>

              {/* Skills Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.skillInput}
                    onChange={(e) =>
                      setFormData({ ...formData, skillInput: e.target.value })
                    }
                    onKeyPress={handleSkillInputKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Type a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Skills Tags */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    createSkillCategory.isPending ||
                    updateSkillCategory.isPending ||
                    formData.skills.length === 0
                  }
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                >
                  {editing ? "Update" : "Add"} Category
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

        {/* Skill Categories List */}
        {skillCategories && skillCategories.length > 0 ? (
          <div className="space-y-4">
            {skillCategories.map((category: any) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {category.skills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
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
              <p className="text-gray-600 mb-4">No skill categories added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                Add Your First Skill Category
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
