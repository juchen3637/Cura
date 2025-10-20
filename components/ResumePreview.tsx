"use client";

import { useResumeStore } from "@/store/resumeStore";
import { formatDateRange } from "@/lib/dateFormatter";

export default function ResumePreview() {
  const { resume } = useResumeStore();

  const getTemplateStyles = () => {
    return {
      container: "w-full max-w-4xl mx-auto bg-white p-8 font-serif leading-normal print:max-w-full print:p-0 print:text-[9pt] print:leading-tight print:bg-white",
      name: "text-2xl font-bold text-center mb-2 tracking-tight print:text-[16pt] print:mb-1",
      contactLine: "text-xs text-center mb-1 text-gray-700 print:text-[9pt] print:mb-0",
      section: "mb-4 print:mb-2",
      sectionTitle: "text-xs font-bold uppercase tracking-widest border-b border-black pb-1 mb-2 print:text-[9pt] print:mb-1 print:pb-0.5",
      companyLine: "flex justify-between items-baseline mb-0.5 print:mb-0",
      company: "font-bold text-sm print:text-[9pt]",
      role: "italic text-sm print:text-[9pt]",
      location: "text-xs text-gray-700 print:text-[8pt]",
      dates: "text-xs text-gray-700 text-right whitespace-nowrap print:text-[8pt]",
      bullets: "ml-4 mt-1 space-y-0.5 print:ml-4 print:mt-0.5 print:space-y-0",
      spacing: "mb-3 print:mb-1.5",
    };
  };

  const styles = getTemplateStyles();

  return (
    <div
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
                    <li key={bulletIdx} className="text-gray-800 leading-normal text-sm print:text-[9pt] print:leading-tight">
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
                    <li key={bulletIdx} className="text-gray-800 leading-normal text-sm print:text-[9pt] print:leading-tight">
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
          <div className="text-gray-800 leading-normal text-sm print:text-[9pt] print:leading-tight">
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
  );
}

