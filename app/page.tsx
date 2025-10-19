"use client";

import { useState, useRef } from "react";
import { useResumeStore } from "@/store/resumeStore";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";
import { exportToPdf, downloadJson, loadJson } from "@/lib/exporters/pdfExporter";

export default function Home() {
  const { resume, setResume, aiEnabled, setAiEnabled } = useResumeStore();
  const [activeSection, setActiveSection] = useState("basics");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sections = [
    { id: "basics", label: "Basic Info" },
    { id: "education", label: "Education" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
  ];

  const handleImportJson = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const loadedResume = await loadJson(file);
        setResume(loadedResume);
        alert("Resume imported successfully!");
      } catch (error) {
        alert("Failed to import resume. Please check the file format.");
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadJson = () => {
    downloadJson(resume, `${resume.basics.name || "resume"}.resume.json`);
  };

  const handleExportPdf = () => {
    exportToPdf();
  };

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white print:min-h-0">
      {/* Toolbar */}
      <header className="bg-white shadow-sm sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Resume Editor</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleImportJson}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
              >
                Import JSON
              </button>
              <button
                onClick={handleDownloadJson}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Download JSON
              </button>
              <button
                onClick={handleExportPdf}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Export PDF
              </button>
              {/* AI Features - Hidden for now */}
              {/* <button
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`px-4 py-2 rounded transition-colors text-sm font-medium ${
                  aiEnabled
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {aiEnabled ? "AI: ON" : "AI: OFF"}
              </button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.resume.json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 py-6 print:p-0 print:max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:gap-0">
          {/* Left - Editor with Tabs */}
          <div className="bg-white rounded-lg shadow print:hidden">
            {/* Horizontal Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-1 p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                      activeSection === section.id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

          {/* Right - Preview */}
          <div className="bg-gray-50 rounded-lg shadow p-6 overflow-auto sticky top-24 h-[calc(100vh-7rem)] print:p-0 print:bg-white print:shadow-none print:static print:h-auto print:overflow-visible">
            <h2 className="text-lg font-bold mb-4 text-gray-700 print:hidden">
              Live Preview
            </h2>
            <div className="bg-white shadow-lg print:shadow-none print:bg-white">
              <ResumePreview />
            </div>
          </div>
        </div>
      </div>

      {/* AI Enabled Notice - Hidden for now */}
      {/* {aiEnabled && (
        <div className="fixed bottom-4 right-4 bg-purple-100 border border-purple-300 rounded-lg p-4 max-w-xs shadow-lg print:hidden">
          <p className="text-sm text-purple-800">
            <strong>AI Assist Enabled</strong>
            <br />
            Click "Improve" on any bullet point to get AI-powered suggestions.
          </p>
        </div>
      )} */}
    </div>
  );
}

