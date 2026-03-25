"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/store/resumeStore";
import { useToast } from "@/lib/hooks/useToast";
import Toast from "@/components/Toast";

export default function GettingStartedPage() {
  const router = useRouter();
  const { setResume } = useResumeStore();
  const { toast, hideToast, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleCreateNew = () => {
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
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfData: base64Data, mediaType: "application/pdf" }),
      });

      if (!response.ok) throw new Error("Failed to parse PDF");

      const parsedResume = await response.json();

      const saveResponse = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: parsedResume.basics?.name || "My Resume",
          resume_data: parsedResume,
        }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save resume");

      const savedResume = await saveResponse.json();
      setResume(parsedResume);
      router.push(`/resume-editor?resumeId=${savedResume.id}`);
    } catch (err) {
      console.error("Resume upload failed:", err);
      showError("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to Cura!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Let&apos;s get your resume set up. How would you like to start?
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Option 1: Create from scratch */}
          <button
            onClick={handleCreateNew}
            className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-6 text-left transition-all hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Start from scratch
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Open the resume editor and build your resume section by section.
            </p>
          </button>

          {/* Option 2: Upload existing */}
          <button
            onClick={handleUploadPdf}
            disabled={uploading}
            className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl p-6 text-left transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 transition-colors">
              {uploading ? (
                <svg className="animate-spin w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {uploading ? "Parsing resume..." : "Upload existing resume"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Import your existing PDF resume and edit it in Cura.
            </p>
          </button>

          {/* Option 3: Build profile */}
          <button
            onClick={() => router.push("/profile")}
            className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 rounded-xl p-6 text-left transition-all hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Build your profile
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add your work experience, education, projects, and skills. Let AI curate resumes for you.
            </p>
          </button>
        </div>

        {/* What each option unlocks */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
            Pro tip: Build your profile to unlock AI-powered features
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1.5">
            <li className="flex items-start">
              <span className="mr-2 mt-0.5">•</span>
              <span>The <strong>AI Pipeline</strong> can generate tailored resumes, outreach emails, and cover letters from a single job description — once your profile has your experience and skills.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-0.5">•</span>
              <span>You can always upload or create a resume first, then fill in your profile later.</span>
            </li>
          </ul>
        </div>

        {/* Skip link */}
        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Skip for now, go to dashboard
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
