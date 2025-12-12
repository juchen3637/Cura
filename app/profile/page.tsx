"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  useProfile,
  useUpdateProfile,
  useExperiences,
  useEducation,
  useProjects,
  useSkillCategories,
  useCreateExperience,
  useCreateEducation,
  useCreateProject,
  useCreateSkillCategory,
} from "@/lib/hooks/useProfile";

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: experiences } = useExperiences();
  const { data: education } = useEducation();
  const { data: projects } = useProjects();
  const { data: skillCategories } = useSkillCategories();

  const createExperience = useCreateExperience();
  const createEducation = useCreateEducation();
  const createProject = useCreateProject();
  const createSkillCategory = useCreateSkillCategory();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    location: "",
    phone: "",
    links: [] as string[]
  });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [newLink, setNewLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadPdf = () => {
    fileInputRef.current?.click();
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setUploadingPdf(true);

    try {
      // Check PDF import rate limit
      const rateLimitResponse = await fetch("/api/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiType: "pdf_import" }),
      });

      if (!rateLimitResponse.ok) {
        if (rateLimitResponse.status === 429) {
          const limitData = await rateLimitResponse.json();
          alert(
            `PDF import limit exceeded. You have ${limitData.remaining || 0} imports remaining this month. Limit resets on ${new Date(limitData.reset_date).toLocaleDateString()}.`
          );
          setUploadingPdf(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

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

      if (!response.ok) throw new Error("Failed to parse PDF");

      const parsedResume = await response.json();

      // Update profile with basic information if available
      if (parsedResume.basics) {
        const profileUpdates: any = {};

        if (parsedResume.basics.name && !profile?.full_name) {
          profileUpdates.full_name = parsedResume.basics.name;
        }

        if (parsedResume.basics.location && !profile?.location) {
          profileUpdates.location = parsedResume.basics.location;
        }

        if (parsedResume.basics.contact?.phone && !profile?.phone) {
          profileUpdates.phone = parsedResume.basics.contact.phone;
        }

        // Extract links from contact
        const extractedLinks: string[] = [];
        if (parsedResume.basics.contact?.links && Array.isArray(parsedResume.basics.contact.links)) {
          extractedLinks.push(...parsedResume.basics.contact.links);
        }

        // Merge with existing links if any
        if (extractedLinks.length > 0) {
          const existingLinks = profile?.links || [];
          const allLinks = [...existingLinks, ...extractedLinks];
          // Remove duplicates
          profileUpdates.links = Array.from(new Set(allLinks));
        }

        // Update profile if there are any changes
        if (Object.keys(profileUpdates).length > 0) {
          await updateProfile.mutateAsync(profileUpdates);
        }
      }

      // Add all experiences via API
      for (const exp of parsedResume.experience || []) {
        const expResponse = await fetch("/api/profile/experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: exp.company || "",
            role: exp.role || "",
            location: exp.location || null,
            start_date: exp.start || null,
            end_date: exp.end || null,
            bullets: exp.bullets || [],
          }),
        });
        if (!expResponse.ok) throw new Error("Failed to add experience");
      }

      // Add all education via API
      for (const edu of parsedResume.education || []) {
        const eduResponse = await fetch("/api/profile/education", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            institution: edu.institution || "",
            degree: edu.degree || "",
            location: edu.location || null,
            start_date: edu.start || null,
            end_date: edu.end || null,
          }),
        });
        if (!eduResponse.ok) throw new Error("Failed to add education");
      }

      // Add all projects via API
      for (const proj of parsedResume.projects || []) {
        const projResponse = await fetch("/api/profile/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: proj.name || "",
            link: proj.link || null,
            bullets: proj.bullets || [],
            tags: [],
          }),
        });
        if (!projResponse.ok) throw new Error("Failed to add project");
      }

      // Add all skill categories via API
      for (const skillCat of parsedResume.skills || []) {
        const skillResponse = await fetch("/api/profile/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: skillCat.name || "",
            skills: skillCat.skills || [],
          }),
        });
        if (!skillResponse.ok) throw new Error("Failed to add skill category");
      }

      alert("Resume imported successfully! All data has been added to your profile.");
      window.location.reload();
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import resume from PDF. Please try again.");
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleEditProfile = () => {
    setProfileForm({
      full_name: profile?.full_name || "",
      location: profile?.location || "",
      phone: profile?.phone || "",
      links: profile?.links || []
    });
    setEditingProfile(true);
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      setProfileForm({
        ...profileForm,
        links: [...profileForm.links, newLink.trim()]
      });
      setNewLink("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setProfileForm({
      ...profileForm,
      links: profileForm.links.filter((_, i) => i !== index)
    });
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(profileForm);
      setEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  if (profileLoading) {
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
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const profileSections = [
    {
      title: "Work Experience",
      href: "/profile/experiences",
      count: experiences?.length || 0,
      description: "Manage your work history and achievements",
      color: "blue",
    },
    {
      title: "Education",
      href: "/profile/education",
      count: education?.length || 0,
      description: "Add your degrees and certifications",
      color: "green",
    },
    {
      title: "Projects",
      href: "/profile/projects",
      count: projects?.length || 0,
      description: "Showcase your personal and professional projects",
      color: "purple",
    },
    {
      title: "Skills",
      href: "/profile/skills",
      count: skillCategories?.length || 0,
      description: "Organize your technical and soft skills",
      color: "orange",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handlePdfUpload}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Manage your professional profile - add unlimited experiences, projects, and skills
              </p>
            </div>
            <button
              onClick={handleUploadPdf}
              disabled={uploadingPdf}
              className="inline-flex items-center px-4 py-2 border border-purple-600 rounded-lg text-sm font-medium text-purple-600 bg-white hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingPdf ? (
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
                  Import Resume PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            {!editingProfile ? (
              <button
                onClick={handleEditProfile}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {editingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, location: e.target.value })
                  }
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  placeholder="e.g., (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Links (LinkedIn, GitHub, Portfolio, etc.)
                </label>
                <div className="space-y-2">
                  {profileForm.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={link}
                        disabled
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="https://linkedin.com/in/yourname"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLink();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{profile?.full_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{profile?.location || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{profile?.phone || "Not set"}</p>
              </div>
              {profile?.links && profile.links.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Links</p>
                  <div className="space-y-1">
                    {profile.links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Master Profile</h3>
              <p className="text-sm text-blue-800">
                Add all your experiences, projects, and skills here. The AI will select the best ones for each job application you create.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Sections Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {profileSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.count} item{section.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
