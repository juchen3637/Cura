"use client";

import { useRef, useEffect, useState } from "react";
import { useResumeStore, defaultStyleSettings, ResumeStyleSettings } from "@/store/resumeStore";
import { formatDateRange } from "@/lib/dateFormatter";
import { ResumeLink } from "@/types/resume";

// Helper function to parse **bold** markdown syntax
function parseMarkdownBold(text: string): React.ReactNode {
  if (!text) return text;
  
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      // Remove the ** markers and wrap in <strong>
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    return part;
  });
}

// Helper function to get friendly link name and full URL
function getLinkInfo(link: ResumeLink): { name: string; url: string } {
  // Ensure link has protocol for href
  const url = link.url.startsWith("http") ? link.url : `https://${link.url}`;
  
  // If displayName is provided, use it
  if (link.displayName && link.displayName.trim()) {
    return { name: link.displayName, url };
  }
  
  // Otherwise show the full URL
  return { name: link.url, url };
}

// Style Settings Modal Component
function StyleSettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdate, 
  onReset 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  settings: ResumeStyleSettings;
  onUpdate: (settings: Partial<ResumeStyleSettings>) => void;
  onReset: () => void;
}) {
  if (!isOpen) return null;

  const lineHeightOptions: { value: ResumeStyleSettings["lineHeight"]; label: string }[] = [
    { value: "tight", label: "Tight" },
    { value: "snug", label: "Snug" },
    { value: "normal", label: "Normal" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-bold">Resume Style Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Font Sizes Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Font Sizes (pt)</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  type="number"
                  min="10"
                  max="24"
                  step="0.5"
                  value={settings.nameSize}
                  onChange={(e) => onUpdate({ nameSize: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Section Headers</label>
                <input
                  type="number"
                  min="8"
                  max="18"
                  step="0.5"
                  value={settings.sectionHeaderSize}
                  onChange={(e) => onUpdate({ sectionHeaderSize: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Body Text</label>
                <input
                  type="number"
                  min="8"
                  max="14"
                  step="0.5"
                  value={settings.bodyTextSize}
                  onChange={(e) => onUpdate({ bodyTextSize: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Contact Line</label>
                <input
                  type="number"
                  min="7"
                  max="12"
                  step="0.5"
                  value={settings.contactLineSize}
                  onChange={(e) => onUpdate({ contactLineSize: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Spacing Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Spacing</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Section Margin</label>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={settings.sectionMargin}
                  onChange={(e) => onUpdate({ sectionMargin: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{settings.sectionMargin}</span>
              </div>
              <div>
                <label className="block text-sm mb-1">Entry Spacing</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={settings.entrySpacing}
                  onChange={(e) => onUpdate({ entrySpacing: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{settings.entrySpacing}</span>
              </div>
              <div>
                <label className="block text-sm mb-1">Bullet Indent</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={settings.bulletIndent}
                  onChange={(e) => onUpdate({ bulletIndent: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{settings.bulletIndent}</span>
              </div>
              <div>
                <label className="block text-sm mb-1">Header Margin</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={settings.headerMargin}
                  onChange={(e) => onUpdate({ headerMargin: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{settings.headerMargin}</span>
              </div>
            </div>
          </div>

          {/* Line Height Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">Line Height</h3>
            <div className="flex gap-2">
              {lineHeightOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdate({ lineHeight: option.value })}
                  className={`flex-1 py-2 px-3 rounded text-sm ${
                    settings.lineHeight === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-between sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResumePreview() {
  const { resume, styleSettings, setStyleSettings, resetStyleSettings } = useResumeStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Use default if styleSettings is undefined (for backward compatibility)
  const settings = styleSettings || defaultStyleSettings;

  // Calculate page count based on print dimensions
  useEffect(() => {
    if (previewRef.current) {
      const contentHeight = previewRef.current.scrollHeight;
      const screenToPrintRatio = 0.75;
      const adjustedHeight = contentHeight * screenToPrintRatio;
      const pageHeight = 864;
      const calculatedPages = Math.max(1, Math.ceil(adjustedHeight / pageHeight));
      setPageCount(calculatedPages);
    }
  }, [resume, settings]);

  // Convert spacing number to Tailwind margin class
  const getMarginClass = (value: number) => {
    const spacingMap: { [key: number]: string } = {
      0.5: "mb-0.5",
      1: "mb-1",
      1.5: "mb-1.5",
      2: "mb-2",
      2.5: "mb-2.5",
      3: "mb-3",
      3.5: "mb-3.5",
      4: "mb-4",
    };
    return spacingMap[value] || "mb-1";
  };

  const getMarginLeftClass = (value: number) => {
    const spacingMap: { [key: number]: string } = {
      1: "ml-1",
      1.5: "ml-1.5",
      2: "ml-2",
      2.5: "ml-2.5",
      3: "ml-3",
      3.5: "ml-3.5",
      4: "ml-4",
      5: "ml-5",
      6: "ml-6",
    };
    return spacingMap[value] || "ml-2";
  };

  const lineHeightClass = {
    tight: "leading-tight",
    snug: "leading-snug",
    normal: "leading-normal",
  }[settings.lineHeight];

  return (
    <div>
      {/* Edit Style Button */}
      <div className="mb-3 print:hidden">
        <button
          onClick={() => setShowSettings(true)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Edit Resume Properties
        </button>
      </div>

      {/* Settings Modal */}
      <StyleSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={setStyleSettings}
        onReset={resetStyleSettings}
      />

      {/* Page count warning */}
      {pageCount > 1 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 print:hidden">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                Resume Length Warning
              </h3>
              <p className="text-sm text-yellow-800">
                Your resume is approximately <strong>{pageCount} pages</strong>. Most recruiters
                prefer resumes to be 1 page. Consider removing less relevant experiences or
                condensing bullet points.
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        ref={previewRef}
        id="resume-preview"
        className={`w-full max-w-4xl mx-auto bg-white p-3 sm:p-4 md:p-5 font-cmu-serif ${lineHeightClass} print:max-w-full print:p-4 print:bg-white`}
        style={{ fontSize: `${settings.bodyTextSize}pt` }}
      >
        {/* Header */}
        <header className={getMarginClass(settings.headerMargin)}>
          <h1 
            className="font-bold text-center mb-0.5 tracking-tight"
            style={{ fontSize: `${settings.nameSize}pt` }}
          >
            {resume.basics.name || "Your Name"}
          </h1>
          <div 
            className="text-center text-gray-700"
            style={{ fontSize: `${settings.contactLineSize}pt` }}
          >
            {resume.basics.location && <span>{resume.basics.location}</span>}
            {resume.basics.location && (resume.basics.contact.phone || resume.basics.contact.email || resume.basics.contact.links.length > 0) && (
              <span className="mx-1">|</span>
            )}
            {resume.basics.contact.phone && (
              <span>{resume.basics.contact.phone}</span>
            )}
            {resume.basics.contact.phone && resume.basics.contact.email && (
              <span className="mx-1">|</span>
            )}
            {resume.basics.contact.email && (
              <span>{resume.basics.contact.email}</span>
            )}
            {(resume.basics.contact.email || resume.basics.contact.phone) &&
              resume.basics.contact.links.length > 0 && (
                <span className="mx-1">|</span>
              )}
            {resume.basics.contact.links.map((link, idx) => {
              const linkInfo = getLinkInfo(link);
              return (
                <span key={idx}>
                  {idx > 0 && <span className="mx-1">|</span>}
                  <a 
                    href={linkInfo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {linkInfo.name}
                  </a>
                </span>
              );
            })}
          </div>
        </header>

        {/* Education */}
        {resume.education.length > 0 && (
          <section className={getMarginClass(settings.sectionMargin)}>
            <h2 
              className="font-bold uppercase tracking-wide border-b border-black pb-0 mb-0.5"
              style={{ fontSize: `${settings.sectionHeaderSize}pt` }}
            >
              Education
            </h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className={getMarginClass(settings.entrySpacing)}>
                <div className="flex justify-between items-baseline mb-0 gap-1">
                  <div>
                    <h3 className="font-bold">
                      {edu.institution || "University Name"}
                    </h3>
                  </div>
                  {edu.location && (
                    <div className="text-gray-700 text-right">{edu.location}</div>
                  )}
                </div>
                <div className="flex justify-between items-baseline mb-0 gap-1">
                  <div className="italic">
                    {edu.degree || "Degree"}
                  </div>
                  <div className="text-right">
                    <div className="text-gray-700 whitespace-nowrap">
                      {formatDateRange(edu.start, edu.end) || "Start - End"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <section className={getMarginClass(settings.sectionMargin)}>
            <h2 
              className="font-bold uppercase tracking-wide border-b border-black pb-0 mb-0.5"
              style={{ fontSize: `${settings.sectionHeaderSize}pt` }}
            >
              Experience
            </h2>
            {resume.experience.map((exp, idx) => (
              <div key={idx} className={getMarginClass(settings.entrySpacing)}>
                <div className="flex justify-between items-baseline mb-0 gap-1">
                  <div>
                    <span className="font-bold">
                      {exp.company || "Company Name"}
                    </span>
                  </div>
                  <div className="text-gray-700 text-right">{exp.location || "Location"}</div>
                </div>
                <div className="flex justify-between items-baseline mb-0 gap-1">
                  {exp.role && (
                    <div className="italic">{exp.role}</div>
                  )}
                  <div className="text-right">
                    <div className="text-gray-700 whitespace-nowrap">
                      {formatDateRange(exp.start, exp.end) || "Start - End"}
                    </div>
                  </div>
                </div>
                {exp.bullets.length > 0 && (
                  <ul className={`${getMarginLeftClass(settings.bulletIndent)} mt-0 space-y-0 ${lineHeightClass}`}>
                    {exp.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className={`text-gray-800 ${lineHeightClass}`}>
                        • {parseMarkdownBold(bullet)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <section className={getMarginClass(settings.sectionMargin)}>
            <h2 
              className="font-bold uppercase tracking-wide border-b border-black pb-0 mb-0.5"
              style={{ fontSize: `${settings.sectionHeaderSize}pt` }}
            >
              Projects
            </h2>
            {resume.projects.map((proj, idx) => (
              <div key={idx} className={getMarginClass(settings.entrySpacing)}>
                <div className="flex justify-between items-baseline mb-0 gap-1">
                  <div>
                    <span className="font-bold">{proj.name || "Project Name"}</span>
                    {proj.link && (
                      <span className="text-gray-600 italic text-sm ml-2">
                        | {proj.link}
                      </span>
                    )}
                  </div>
                </div>
                {proj.bullets.length > 0 && (
                  <ul className={`${getMarginLeftClass(settings.bulletIndent)} mt-0 space-y-0 ${lineHeightClass}`}>
                    {proj.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className={`text-gray-800 ${lineHeightClass}`}>
                        • {parseMarkdownBold(bullet)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <section className={getMarginClass(settings.sectionMargin)}>
            <h2 
              className="font-bold uppercase tracking-wide border-b border-black pb-0 mb-0.5"
              style={{ fontSize: `${settings.sectionHeaderSize}pt` }}
            >
              Skills
            </h2>
            <div className={`text-gray-800 ${lineHeightClass}`}>
              {resume.skills.map((category, idx) => (
                <div key={idx} className="mb-0">
                  {category.name && category.skills.length > 0 && (
                    <>
                      <span className="font-bold">{category.name}:</span>{" "}
                      {category.skills.filter(s => s.trim()).join(", ")}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
