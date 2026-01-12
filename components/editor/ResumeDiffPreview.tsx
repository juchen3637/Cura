"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import ChangeOverlay from "./ChangeOverlay";

export default function ResumeDiffPreview() {
  const { resume, inlineSuggestions, applySuggestion, rejectSuggestion, clearSuggestions } = useResumeStore();
  const [activeChange, setActiveChange] = useState<string | null>(null);

  const pendingChanges = inlineSuggestions.filter((s) => s.status === "pending");
  const appliedCount = inlineSuggestions.filter((s) => s.status === "applied").length;
  const rejectedCount = inlineSuggestions.filter((s) => s.status === "rejected").length;

  const handleChangeClick = (changeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveChange(activeChange === changeId ? null : changeId);
  };

  // Track which changes have been rendered
  const [renderedChangeIds, setRenderedChangeIds] = useState<Set<string>>(new Set());

  const renderBulletWithHighlight = (bullet: string, expIndex: number, bulletIndex: number, isProject = false) => {
    const section = isProject ? "project" : "experience";

    // Try exact match first
    let matchingChange = pendingChanges.find(
      (s) =>
        s.section === section &&
        s.sectionIndex === expIndex &&
        s.bulletIndex === bulletIndex &&
        s.originalText === bullet
    );

    // If no exact match, try trimmed comparison (handle whitespace differences)
    if (!matchingChange) {
      matchingChange = pendingChanges.find(
        (s) =>
          s.section === section &&
          s.sectionIndex === expIndex &&
          s.bulletIndex === bulletIndex &&
          s.originalText?.trim() === bullet.trim()
      );
    }

    if (!matchingChange) {
      return <li key={bulletIndex} className="text-sm">{bullet}</li>;
    }

    // Mark this change as rendered
    renderedChangeIds.add(matchingChange.id);

    const isActive = activeChange === matchingChange.id;

    return (
      <li key={bulletIndex} className="text-sm relative">
        <div
          onClick={(e) => handleChangeClick(matchingChange.id, e)}
          className="cursor-pointer hover:bg-blue-50 p-2 -ml-2 rounded transition-colors"
        >
          {/* Current text with strikethrough (red) */}
          <div className="bg-red-100 border border-red-300 px-2 py-1 rounded mb-1">
            <span className="text-red-800 line-through">{matchingChange.originalText}</span>
          </div>

          {/* Suggested text (green) */}
          <div className="bg-green-100 border border-green-300 px-2 py-1 rounded">
            <span className="text-green-800">{matchingChange.suggestedText}</span>
          </div>

          {/* Approve/Decline buttons */}
          {isActive && (
            <div className="mt-2 flex gap-2 items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  applySuggestion(matchingChange.id);
                  setActiveChange(null);
                }}
                className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  rejectSuggestion(matchingChange.id);
                  setActiveChange(null);
                }}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                Decline
              </button>
              {matchingChange.reasoning && (
                <span className="text-xs text-gray-600 italic ml-2">
                  {matchingChange.reasoning}
                </span>
              )}
            </div>
          )}

          {!isActive && (
            <div className="mt-1 text-xs text-blue-600">
              Click to review
            </div>
          )}
        </div>
      </li>
    );
  };

  // If no pending changes remain, auto-clear and return to normal view
  if (pendingChanges.length === 0 && inlineSuggestions.length > 0) {
    // Auto-clear after a brief moment
    setTimeout(() => {
      clearSuggestions();
    }, 100);

    return (
      <div className="bg-white p-10">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">All changes reviewed!</h3>
          <p className="text-gray-600">
            {appliedCount} approved, {rejectedCount} declined
          </p>
          <p className="text-sm text-gray-500 mt-2">Returning to preview...</p>
        </div>
      </div>
    );
  }

  // Find unmatched changes
  const unmatchedChanges = pendingChanges.filter((change) => !renderedChangeIds.has(change.id));

  // Debug logging
  console.log("Total pending changes:", pendingChanges.length);
  console.log("Unmatched changes:", unmatchedChanges.length);
  if (unmatchedChanges.length > 0) {
    console.log("Unmatched change details:", unmatchedChanges);
  }

  return (
    <div className="relative">
      {/* Stats Banner with Live Count */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {pendingChanges.length} pending
            </span>
            <span className="text-xs text-gray-600">
              {appliedCount} approved
            </span>
            <span className="text-xs text-gray-600">
              {rejectedCount} declined
            </span>
          </div>
          <span className="text-xs text-blue-700">
            Click highlighted items to review
          </span>
        </div>
      </div>

      {/* Unmatched Changes Warning */}
      {pendingChanges.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Some changes may not appear in the preview below. Check the browser console for details.
          </p>
        </div>
      )}

      {/* Resume Preview with Inline Diffs */}
      <div className="bg-white p-10 shadow-sm" onClick={() => setActiveChange(null)}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1">{resume.basics.name}</h1>
          <p className="text-lg italic mb-2">{resume.basics.title}</p>
          <p className="text-sm">{resume.basics.location}</p>
          <p className="text-sm">
            {resume.basics.contact.phone} | {resume.basics.contact.email}
            {resume.basics.contact.links.map((link, idx) => {
              // Handle both old string format and new object format
              const displayName = typeof link === 'string' ? link : (link?.displayName || link?.url || '');
              return <span key={idx}> | {displayName}</span>;
            })}
          </p>
        </div>

        {/* Summary */}
        {resume.basics.summary && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase mb-2 border-b border-black">Summary</h2>
            <p className="text-sm">{resume.basics.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase mb-3 border-b border-black">Experience</h2>
            {resume.experience.map((exp, expIdx) => (
              <div key={expIdx} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <p className="font-bold">{exp.company}</p>
                  <p className="text-sm">
                    {exp.start} - {exp.end}
                  </p>
                </div>
                <p className="italic text-sm mb-2">{exp.role}</p>
                <ul className="list-disc list-inside space-y-1">
                  {exp.bullets.map((bullet, bulletIdx) =>
                    renderBulletWithHighlight(bullet, expIdx, bulletIdx, false)
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase mb-3 border-b border-black">Education</h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold">{edu.institution}</p>
                  <p className="text-sm">{edu.end}</p>
                </div>
                <p className="italic text-sm">{edu.degree}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase mb-3 border-b border-black">Projects</h2>
            {resume.projects.map((proj, projIdx) => (
              <div key={projIdx} className="mb-3">
                <p className="font-bold">{proj.name}</p>
                <ul className="list-disc list-inside space-y-1">
                  {proj.bullets.map((bullet, bulletIdx) =>
                    renderBulletWithHighlight(bullet, projIdx, bulletIdx, true)
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase mb-3 border-b border-black">Skills</h2>
            {resume.skills.map((category, catIdx) => {
              // Check for skill changes in this category
              const skillChanges = pendingChanges.filter(
                (s) => s.section === "skills" && s.sectionIndex === catIdx
              );

              return (
                <div key={catIdx} className="mb-2">
                  <p className="text-sm">
                    <span className="font-semibold">{category.name}:</span>{" "}
                    {category.skills.map((skill, skillIdx) => {
                      // Check if this specific skill has a change
                      const skillChange = skillChanges.find(
                        (s) => s.bulletIndex === skillIdx && s.originalText === skill
                      );

                      if (skillChange) {
                        renderedChangeIds.add(skillChange.id);
                        const isActive = activeChange === skillChange.id;

                        return (
                          <span key={skillIdx}>
                            <span
                              onClick={(e) => handleChangeClick(skillChange.id, e)}
                              className="inline-block cursor-pointer hover:bg-blue-50 p-1 rounded"
                            >
                              <span className="bg-red-100 border border-red-300 px-2 py-0.5 rounded line-through text-red-800">
                                {skillChange.originalText}
                              </span>
                              <span className="mx-1">→</span>
                              <span className="bg-green-100 border border-green-300 px-2 py-0.5 rounded text-green-800">
                                {skillChange.suggestedText}
                              </span>

                              {isActive && (
                                <span className="block mt-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      applySuggestion(skillChange.id);
                                    }}
                                    className="px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded mr-1"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      rejectSuggestion(skillChange.id);
                                    }}
                                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded"
                                  >
                                    Decline
                                  </button>
                                </span>
                              )}
                            </span>
                            {skillIdx < category.skills.length - 1 && ", "}
                          </span>
                        );
                      }

                      return (
                        <span key={skillIdx}>
                          {skill}
                          {skillIdx < category.skills.length - 1 && ", "}
                        </span>
                      );
                    })}

                    {/* New skill additions for this category */}
                    {skillChanges
                      .filter((s) => s.originalText === "" || !s.originalText)
                      .map((addChange) => {
                        renderedChangeIds.add(addChange.id);
                        const isActive = activeChange === addChange.id;

                        return (
                          <span key={addChange.id}>
                            {category.skills.length > 0 && ", "}
                            <span
                              onClick={(e) => handleChangeClick(addChange.id, e)}
                              className="inline-block cursor-pointer hover:bg-blue-50 p-1 rounded"
                            >
                              <span className="bg-green-100 border border-green-300 px-2 py-0.5 rounded text-green-800">
                                + {addChange.suggestedText}
                              </span>

                              {isActive && (
                                <span className="block mt-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      applySuggestion(addChange.id);
                                    }}
                                    className="px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded mr-1"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      rejectSuggestion(addChange.id);
                                    }}
                                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded"
                                  >
                                    Decline
                                  </button>
                                </span>
                              )}
                            </span>
                          </span>
                        );
                      })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unmatched Changes Section */}
      {unmatchedChanges.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-bold text-yellow-900 mb-3">
            Additional Changes ({unmatchedChanges.length})
          </h3>
          <p className="text-xs text-yellow-800 mb-3">
            These changes could not be automatically matched to the preview. Review them below:
          </p>
          <div className="space-y-3">
            {unmatchedChanges.map((change) => (
              <div key={change.id} className="bg-white border border-yellow-300 rounded-lg p-3">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-700">
                    {change.section} (Index: {change.sectionIndex})
                    {change.bulletIndex !== undefined && ` - Bullet ${change.bulletIndex}`}
                  </span>
                </div>

                {/* Current text (red) */}
                <div className="bg-red-100 border border-red-300 px-2 py-1 rounded mb-2">
                  <p className="text-xs font-semibold text-red-700 mb-1">Current:</p>
                  <p className="text-sm text-red-900 line-through">{change.originalText}</p>
                </div>

                {/* Suggested text (green) */}
                <div className="bg-green-100 border border-green-300 px-2 py-1 rounded mb-2">
                  <p className="text-xs font-semibold text-green-700 mb-1">Suggested:</p>
                  <p className="text-sm text-green-900">{change.suggestedText}</p>
                </div>

                {change.reasoning && (
                  <p className="text-xs text-gray-600 italic mb-2">{change.reasoning}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applySuggestion(change.id);
                    }}
                    className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rejectSuggestion(change.id);
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

