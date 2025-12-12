"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useResumes } from "@/lib/hooks/useResumes";
import { useResumeStore } from "@/store/resumeStore";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";
import ResumeDiffPreview from "@/components/editor/ResumeDiffPreview";
import { exportToPdf } from "@/lib/exporters/pdfExporter";

export default function ResumeEditor() {
  const searchParams = useSearchParams();
  const resumeIdFromUrl = searchParams.get("resumeId");

  const { resume, setResume, inlineSuggestions } = useResumeStore();
  const [activeSection, setActiveSection] = useState("basics");
  const [user, setUser] = useState<any>(null);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(resumeIdFromUrl);
  const [importing, setImporting] = useState(false);
  const [originalResume, setOriginalResume] = useState<any>(null);
  const [resumeTitle, setResumeTitle] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wait for Zustand persist to hydrate
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Debug: log resume data when it changes
  useEffect(() => {
    if (isHydrated) {
      console.log("Resume data in editor:", resume);
    }
  }, [isHydrated, resume]);

  const { data: savedResumes } = useResumes();
  const supabase = createClient();

  // Check if resume has changes
  const hasChanges = JSON.stringify(resume) !== JSON.stringify(originalResume);

  // Check if new resume has any data
  const hasData =
    resume.basics.name.trim() !== "" ||
    resume.basics.title.trim() !== "" ||
    resume.basics.contact.email.trim() !== "" ||
    resume.experience.length > 0 ||
    resume.education.length > 0 ||
    resume.projects.length > 0 ||
    resume.skills.length > 0;

  // Check if we have pending suggestions to show
  const hasPendingSuggestions = inlineSuggestions.some((s) => s.status === "pending");

  // Check auth status
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  // Load resume if resumeId provided
  useEffect(() => {
    if (resumeIdFromUrl && savedResumes) {
      const resumeToLoad = savedResumes.find((r: any) => r.id === resumeIdFromUrl);
      if (resumeToLoad) {
        setResume(resumeToLoad.resume_data);
        setOriginalResume(resumeToLoad.resume_data);
        setCurrentResumeId(resumeToLoad.id);
      }
    }
  }, [resumeIdFromUrl, savedResumes]);

  const sections = [
    { id: "basics", label: "Basic Info" },
    { id: "education", label: "Education" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
  ];

  const handleExportPdf = () => {
    exportToPdf();
  };

  const handleImportPdf = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setImporting(true);

    try {
      // Check PDF import rate limit (only for authenticated users)
      if (user) {
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
            setImporting(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            return;
          }
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

      if (!response.ok) {
        throw new Error("Failed to parse PDF");
      }

      const parsedResume = await response.json();

      // If user is logged in, save to account
      if (user) {
        const saveResponse = await fetch("/api/resumes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: parsedResume.basics.name || "Imported Resume",
            resume_data: parsedResume,
          }),
        });

        if (saveResponse.ok) {
          const savedResume = await saveResponse.json();
          setCurrentResumeId(savedResume.id);
          alert("Resume imported and saved to your account!");
        }
      } else {
        alert("Resume imported successfully!");
      }

      setResume(parsedResume);
      setOriginalResume(parsedResume);
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import resume from PDF. Please try again.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleResumeSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "new") {
      const newResume = {
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
      };
      setResume(newResume);
      setOriginalResume(newResume);
      setCurrentResumeId(null);
      return;
    }

    if (value && savedResumes) {
      const selectedResume = savedResumes.find((r: any) => r.id === value);
      if (selectedResume) {
        setResume(selectedResume.resume_data);
        setOriginalResume(selectedResume.resume_data);
        setCurrentResumeId(selectedResume.id);
      }
    }
  };

  const handleSaveClick = () => {
    if (!user) {
      alert("Please sign in to save your resume");
      return;
    }

    // Pre-fill with current resume title if editing, otherwise use person's name
    let defaultTitle = "My Resume";

    if (currentResumeId && savedResumes) {
      const currentResume = savedResumes.find((r: any) => r.id === currentResumeId);
      defaultTitle = currentResume?.title || resume.basics.name || "My Resume";
    } else {
      defaultTitle = resume.basics.name || "My Resume";
    }

    setResumeTitle(defaultTitle);
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    if (!resumeTitle.trim()) {
      alert("Please enter a resume title");
      return;
    }

    // Check for duplicate names (only when creating new or changing name)
    if (savedResumes) {
      const duplicateExists = savedResumes.some(
        (r: any) =>
          r.title.toLowerCase() === resumeTitle.trim().toLowerCase() &&
          r.id !== currentResumeId
      );

      if (duplicateExists) {
        alert(`A resume named "${resumeTitle}" already exists. Please choose a different name.`);
        return;
      }
    }

    try {
      if (currentResumeId) {
        // Update existing
        const response = await fetch(`/api/resumes/${currentResumeId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_data: resume,
            title: resumeTitle,
          }),
        });

        if (!response.ok) throw new Error("Failed to update resume");
        setOriginalResume(resume);
        setShowSaveDialog(false);
        alert("Resume updated successfully!");
      } else {
        // Create new
        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: resumeTitle,
            resume_data: resume,
          }),
        });

        if (!response.ok) throw new Error("Failed to save resume");
        const savedResume = await response.json();
        setCurrentResumeId(savedResume.id);
        setOriginalResume(resume);
        setShowSaveDialog(false);
        alert("Resume saved successfully!");
      }
    } catch (error) {
      alert("Failed to save resume");
    }
  };

  // Show loading while hydrating
  if (!isHydrated) {
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
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white print:min-h-0">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {user && savedResumes && savedResumes.length > 0 && (
                <select
                  value={currentResumeId || "new"}
                  onChange={handleResumeSelect}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <option value="new">New Resume</option>
                  {savedResumes.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={handleImportPdf}
                disabled={importing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
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
                    Import PDF
                  </>
                )}
              </button>
              {user ? (
                <button
                  onClick={handleSaveClick}
                  disabled={currentResumeId ? !hasChanges : !hasData}
                  className="inline-flex items-center px-4 py-2 border border-green-600 rounded-lg text-sm font-medium text-green-600 bg-white hover:bg-green-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {currentResumeId ? "Update" : "Save"}
                </button>
              ) : (
                <a
                  href="/auth/signup"
                  className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Sign up to Save
                </a>
              )}
              <button
                onClick={handleExportPdf}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:gap-0">
          {/* Left - Editor */}
          <div className="space-y-6 print:hidden">
            {/* Section Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex p-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex-1 min-w-[100px] px-3 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <ResumeForm activeSection={activeSection} />
              </div>
            </div>

            {/* Helper Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Quick Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Use action verbs to start your bullet points</li>
                <li>Include metrics and numbers where possible</li>
                <li>Keep bullet points between 20-150 characters</li>
                <li>Use the live preview to see changes instantly</li>
              </ul>
            </div>
          </div>

          {/* Right - Preview */}
          <div className="print:p-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:sticky lg:top-24 print:border-0 print:shadow-none print:p-0">
              <div className="flex items-center justify-between mb-4 print:hidden">
                <h2 className="text-lg font-semibold text-gray-900">
                  {hasPendingSuggestions ? "Review Changes" : "Live Preview"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                    Live
                  </span>
                </div>
              </div>
              <div className="bg-white print:bg-white">
                {hasPendingSuggestions ? <ResumeDiffPreview /> : <ResumePreview />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowSaveDialog(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {currentResumeId ? "Update Resume" : "Save Resume"}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Title
                </label>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Software Engineer - Google"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && resumeTitle.trim()) {
                      handleSaveConfirm();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfirm}
                  disabled={!resumeTitle.trim()}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {currentResumeId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
