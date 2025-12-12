"use client";

import { useRef, useEffect, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { formatDateRange } from "@/lib/dateFormatter";

export default function ResumePreview() {
  const { resume } = useResumeStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  // Calculate page count based on print dimensions
  useEffect(() => {
    if (previewRef.current) {
      // Use a more accurate calculation based on standard resume dimensions
      // Standard US Letter: 8.5" x 11"
      // With typical 0.5" margins on all sides = 7.5" x 10" usable space
      // At 96 DPI (standard web): 10 inches = 960px height

      // Get computed font size to estimate better
      const computedStyle = window.getComputedStyle(previewRef.current);
      const fontSize = parseFloat(computedStyle.fontSize);
      const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.5;

      // Count approximate lines of content
      const contentHeight = previewRef.current.scrollHeight;

      // Estimate print height: letter size (11") - margins (1" top + 1" bottom) = 9"
      // Convert to pixels: 9 inches * 96 DPI = 864px
      // But account for tighter print spacing (9pt font vs screen font)
      const screenToPrintRatio = 0.75; // Print is typically 75% of screen height
      const adjustedHeight = contentHeight * screenToPrintRatio;

      const pageHeight = 864; // 9 inches at 96 DPI
      const calculatedPages = Math.max(1, Math.ceil(adjustedHeight / pageHeight));

      setPageCount(calculatedPages);
    }
  }, [resume]);

  const getTemplateStyles = () => {
    return {
      container: "w-full max-w-4xl mx-auto bg-white p-4 sm:p-6 md:p-8 font-serif leading-normal print:max-w-full print:p-0 print:text-[9pt] print:leading-tight print:bg-white",
      name: "text-xl sm:text-2xl font-bold text-center mb-2 tracking-tight print:text-[16pt] print:mb-1",
      contactLine: "text-[10px] sm:text-xs text-center mb-1 text-gray-700 print:text-[9pt] print:mb-0 break-words",
      section: "mb-3 sm:mb-4 print:mb-2",
      sectionTitle: "text-[10px] sm:text-xs font-bold uppercase tracking-widest border-b border-black pb-1 mb-2 print:text-[9pt] print:mb-1 print:pb-0.5",
      companyLine: "flex justify-between items-baseline mb-0.5 print:mb-0 gap-2",
      company: "font-bold text-xs sm:text-sm print:text-[9pt]",
      role: "italic text-xs sm:text-sm print:text-[9pt]",
      location: "text-[10px] sm:text-xs text-gray-700 print:text-[8pt] text-right",
      dates: "text-[10px] sm:text-xs text-gray-700 text-right whitespace-nowrap print:text-[8pt]",
      bullets: "ml-3 sm:ml-4 mt-1 space-y-0.5 print:ml-4 print:mt-0.5 print:space-y-0",
      spacing: "mb-2 sm:mb-3 print:mb-1.5",
    };
  };

  const styles = getTemplateStyles();

  return (
    <div>
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
        className={styles.container}
      >
      {/* Header */}
      <header className="mb-3">
        <h1 className={styles.name}>{resume.basics.name || "Your Name"}</h1>
        <div className={styles.contactLine}>
          {resume.basics.location && <span>{resume.basics.location}</span>}
        </div>
        <div className={styles.contactLine}>
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
          {resume.basics.contact.links.map((link, idx) => (
            <span key={idx}>
              {idx > 0 && <span className="mx-1">|</span>}
              <span className="text-blue-700 underline">{link}</span>
            </span>
          ))}
        </div>
      </header>

      {/* Education */}
      {resume.education.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          {resume.education.map((edu, idx) => (
            <div key={idx} className={styles.spacing}>
              <div className={styles.companyLine}>
                <div>
                  <h3 className={styles.company}>
                    {edu.institution || "University Name"}
                  </h3>
                </div>
                {edu.location && (
                  <div className={styles.location}>{edu.location}</div>
                )}
              </div>
              <div className={styles.companyLine}>
                <div className={styles.role}>
                  {edu.degree || "Degree"}
                </div>
                <div className="text-right">
                  <div className={styles.dates}>
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
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          {resume.experience.map((exp, idx) => (
            <div key={idx} className={styles.spacing}>
              <div className={styles.companyLine}>
                <div>
                  <span className={styles.company}>
                    {exp.company || "Company Name"}
                  </span>
                </div>
                <div className={styles.location}>{exp.location || "Location"}</div>
              </div>
              <div className={styles.companyLine}>
                {exp.role && (
                  <div className={styles.role}>{exp.role}</div>
                )}
                <div className="text-right">
                  <div className={styles.dates}>
                    {formatDateRange(exp.start, exp.end) || "Start - End"}
                  </div>
                </div>
              </div>
              {exp.bullets.length > 0 && (
                <ul className={styles.bullets}>
                  {exp.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="text-gray-800 leading-normal text-xs sm:text-sm print:text-[9pt] print:leading-tight">
                      • {bullet}
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
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Projects</h2>
          {resume.projects.map((proj, idx) => (
            <div key={idx} className={styles.spacing}>
              <div className={styles.companyLine}>
                <div>
                  <span className={styles.company}>{proj.name || "Project Name"}</span>
                  {proj.link && (
                    <span className="text-gray-600 italic text-sm ml-2">
                      | {proj.link}
                    </span>
                  )}
                </div>
                <div className={styles.dates}>
                  {/* Optional: add project dates to schema */}
                </div>
              </div>
              {proj.bullets.length > 0 && (
                <ul className={styles.bullets}>
                  {proj.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="text-gray-800 leading-normal text-xs sm:text-sm print:text-[9pt] print:leading-tight">
                      • {bullet}
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
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className="text-gray-800 leading-normal text-xs sm:text-sm print:text-[9pt] print:leading-tight">
            {resume.skills.map((category, idx) => (
              <div key={idx} className="mb-0.5 print:mb-0">
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

