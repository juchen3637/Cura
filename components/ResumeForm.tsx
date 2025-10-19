"use client";

import { useForm } from "react-hook-form";
import { Resume, ResumeExperience } from "@/types/resume";
import { useResumeStore } from "@/store/resumeStore";
import { useState } from "react";
import RewriteModal from "./RewriteModal";

interface ResumeFormProps {
  activeSection: string;
}

export default function ResumeForm({ activeSection }: ResumeFormProps) {
  const { resume, updateResume, aiEnabled } = useResumeStore();
  const { register, handleSubmit, watch, setValue } = useForm<Resume>({
    defaultValues: resume,
    values: resume,
  });

  const [rewriteModal, setRewriteModal] = useState<{
    isOpen: boolean;
    type: "experience" | "project" | null;
    expIdx: number;
    projIdx: number;
    bulletIdx: number;
  }>({ isOpen: false, type: null, expIdx: -1, projIdx: -1, bulletIdx: -1 });

  const onSubmit = (data: Resume) => {
    updateResume(() => data);
  };

  const handleBlur = () => {
    handleSubmit(onSubmit)();
  };

  const addExperience = () => {
    const newExp: ResumeExperience = {
      company: "",
      role: "",
      location: "",
      start: "",
      end: "",
      bullets: [],
    };
    updateResume((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const removeExperience = (idx: number) => {
    updateResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx),
    }));
  };

  const addBullet = (expIdx: number) => {
    updateResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIdx ? { ...exp, bullets: [...exp.bullets, ""] } : exp
      ),
    }));
  };

  const removeBullet = (expIdx: number, bulletIdx: number) => {
    updateResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIdx
          ? { ...exp, bullets: exp.bullets.filter((_, j) => j !== bulletIdx) }
          : exp
      ),
    }));
  };

  const handleRewriteBullet = (expIdx: number, bulletIdx: number) => {
    setRewriteModal({ isOpen: true, type: "experience", expIdx, projIdx: -1, bulletIdx });
  };

  const handleReplaceBullet = (newText: string) => {
    const { type, expIdx, projIdx, bulletIdx } = rewriteModal;
    
    if (type === "experience") {
      updateResume((prev) => ({
        ...prev,
        experience: prev.experience.map((exp, i) =>
          i === expIdx
            ? {
                ...exp,
                bullets: exp.bullets.map((bullet, j) =>
                  j === bulletIdx ? newText : bullet
                ),
              }
            : exp
        ),
      }));
    } else if (type === "project") {
      updateResume((prev) => ({
        ...prev,
        projects: prev.projects.map((proj, i) =>
          i === projIdx
            ? {
                ...proj,
                bullets: proj.bullets.map((bullet, j) =>
                  j === bulletIdx ? newText : bullet
                ),
              }
            : proj
        ),
      }));
    }
  };

  const addEducation = () => {
    updateResume((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: "", degree: "", location: "", start: "", end: "" },
      ],
    }));
  };

  const removeEducation = (idx: number) => {
    updateResume((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx),
    }));
  };

  const addProject = () => {
    updateResume((prev) => ({
      ...prev,
      projects: [...prev.projects, { name: "", link: "", bullets: [] }],
    }));
  };

  const removeProject = (idx: number) => {
    updateResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== idx),
    }));
  };

  const addProjectBullet = (projIdx: number) => {
    updateResume((prev) => ({
      ...prev,
      projects: prev.projects.map((proj, i) =>
        i === projIdx ? { ...proj, bullets: [...proj.bullets, ""] } : proj
      ),
    }));
  };

  const removeProjectBullet = (projIdx: number, bulletIdx: number) => {
    updateResume((prev) => ({
      ...prev,
      projects: prev.projects.map((proj, i) =>
        i === projIdx
          ? { ...proj, bullets: proj.bullets.filter((_, bi) => bi !== bulletIdx) }
          : proj
      ),
    }));
  };

  const addSkillCategory = () => {
    updateResume((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "", skills: [] }],
    }));
  };

  const removeSkillCategory = (catIdx: number) => {
    updateResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== catIdx),
    }));
  };

  const addSkillToCategory = (catIdx: number) => {
    updateResume((prev) => ({
      ...prev,
      skills: prev.skills.map((cat, i) =>
        i === catIdx ? { ...cat, skills: [...cat.skills, ""] } : cat
      ),
    }));
  };

  const removeSkillFromCategory = (catIdx: number, skillIdx: number) => {
    updateResume((prev) => ({
      ...prev,
      skills: prev.skills.map((cat, i) =>
        i === catIdx
          ? { ...cat, skills: cat.skills.filter((_, si) => si !== skillIdx) }
          : cat
      ),
    }));
  };

  const addLink = () => {
    updateResume((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        contact: {
          ...prev.basics.contact,
          links: [...prev.basics.contact.links, ""],
        },
      },
    }));
  };

  const removeLink = (idx: number) => {
    updateResume((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        contact: {
          ...prev.basics.contact,
          links: prev.basics.contact.links.filter((_, i) => i !== idx),
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      {activeSection === "basics" && (
        <section>
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                {...register("basics.name")}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                {...register("basics.location")}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...register("basics.contact.email")}
                onBlur={handleBlur}
                type="email"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                {...register("basics.contact.phone")}
                onBlur={handleBlur}
                type="tel"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Links</label>
              {resume.basics.contact.links.map((_, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    {...register(`basics.contact.links.${idx}`)}
                    onBlur={handleBlur}
                    className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(idx)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Add Link
              </button>
            </div>
          </div>
        </section>
      )}

      {activeSection === "experience" && (
        <section>
          <h2 className="text-xl font-bold mb-4">Experience</h2>
          {resume.experience.map((exp, expIdx) => (
            <div key={expIdx} className="mb-6 p-4 border rounded bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold">Position {expIdx + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeExperience(expIdx)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-3">
                <input
                  {...register(`experience.${expIdx}.company`)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company Name"
                />
                <input
                  {...register(`experience.${expIdx}.role`)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Job Title"
                />
                <input
                  {...register(`experience.${expIdx}.location`)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Location"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register(`experience.${expIdx}.start`)}
                    onBlur={handleBlur}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="YYYY-MM"
                  />
                  <input
                    {...register(`experience.${expIdx}.end`)}
                    onBlur={handleBlur}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="YYYY-MM or Present"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bullet Points
                  </label>
                  {exp.bullets.map((_, bulletIdx) => (
                    <div key={bulletIdx} className="flex gap-2 mb-2">
                      <textarea
                        {...register(
                          `experience.${expIdx}.bullets.${bulletIdx}`
                        )}
                        onBlur={handleBlur}
                        rows={2}
                        className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your achievement..."
                      />
                      <div className="flex flex-col gap-1">
                        {/* AI Features - Hidden for now */}
                        {/* {aiEnabled && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRewriteBullet(expIdx, bulletIdx)
                            }
                            className="px-3 py-2 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 text-sm whitespace-nowrap"
                            title="AI Improve"
                          >
                            Improve
                          </button>
                        )} */}
                        <button
                          type="button"
                          onClick={() => removeBullet(expIdx, bulletIdx)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addBullet(expIdx)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    + Add Bullet
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addExperience}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Experience
          </button>
        </section>
      )}

      {activeSection === "education" && (
        <section>
          <h2 className="text-xl font-bold mb-4">Education</h2>
          {resume.education.map((edu, idx) => (
            <div key={idx} className="mb-4 p-4 border rounded bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold">Education {idx + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-3">
                <input
                  {...register(`education.${idx}.institution`)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="University Name"
                />
                <input
                  {...register(`education.${idx}.degree`)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Degree (e.g., B.S. Computer Science)"
                />
                <input
                  {...register(`education.${idx}.location`)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Location"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register(`education.${idx}.start`)}
                    onBlur={handleBlur}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="YYYY-MM"
                  />
                  <input
                    {...register(`education.${idx}.end`)}
                    onBlur={handleBlur}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="YYYY-MM or Present"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addEducation}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Education
          </button>
        </section>
      )}

      {activeSection === "skills" && (
        <section>
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          <p className="text-sm text-gray-600 mb-4">
            Organize your skills into custom categories (e.g., &quot;Languages&quot;, &quot;Tools&quot;, &quot;Certifications&quot;, etc.)
          </p>
          {resume.skills.map((category, catIdx) => (
            <div key={catIdx} className="mb-4 p-4 border rounded bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <input
                  {...register(`skills.${catIdx}.name`)}
                  onBlur={handleBlur}
                  className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                  placeholder="Category Name (e.g., Languages, Tools, Certifications)"
                />
                <button
                  type="button"
                  onClick={() => removeSkillCategory(catIdx)}
                  className="ml-2 px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                >
                  Remove Category
                </button>
              </div>
              <div className="space-y-2">
                {category.skills.map((_, skillIdx) => (
                  <div key={skillIdx} className="flex gap-2">
                    <input
                      {...register(`skills.${catIdx}.skills.${skillIdx}`)}
                      onBlur={handleBlur}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Skill"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkillFromCategory(catIdx, skillIdx)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSkillToCategory(catIdx)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  + Add Skill
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSkillCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Category
          </button>
        </section>
      )}

      {activeSection === "projects" && (
        <section>
          <h2 className="text-xl font-bold mb-4">Projects</h2>
          {resume.projects.map((proj, projIdx) => (
            <div key={projIdx} className="mb-4 p-4 border rounded bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold">Project {projIdx + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeProject(projIdx)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-3">
                <input
                  {...register(`projects.${projIdx}.name`)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Project Name"
                />
                <input
                  {...register(`projects.${projIdx}.link`)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Project Link (optional)"
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Bullet Points</label>
                  {proj.bullets.map((_, bulletIdx) => (
                    <div key={bulletIdx} className="mb-2">
                      <div className="flex gap-2 items-start">
                        <textarea
                          {...register(`projects.${projIdx}.bullets.${bulletIdx}`)}
                          onBlur={handleBlur}
                          rows={2}
                          className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Describe the project impact or features..."
                        />
                        {/* AI Features - Hidden for now */}
                        {/* {aiEnabled && (
                          <button
                            type="button"
                            onClick={() => {
                              setRewriteModal({
                                isOpen: true,
                                type: "project",
                                expIdx: -1,
                                projIdx: projIdx,
                                bulletIdx: bulletIdx,
                              });
                            }}
                            className="px-3 py-2 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors text-sm whitespace-nowrap"
                            title="AI Improve"
                          >
                            Improve
                          </button>
                        )} */}
                        <button
                          type="button"
                          onClick={() => removeProjectBullet(projIdx, bulletIdx)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addProjectBullet(projIdx)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    + Add Bullet
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addProject}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Project
          </button>
        </section>
      )}

      {aiEnabled && (
        <RewriteModal
          isOpen={rewriteModal.isOpen}
          originalText={
            rewriteModal.type === "experience" && rewriteModal.expIdx >= 0 && rewriteModal.bulletIdx >= 0
              ? resume.experience[rewriteModal.expIdx]?.bullets[rewriteModal.bulletIdx] || ""
              : rewriteModal.type === "project" && rewriteModal.projIdx >= 0 && rewriteModal.bulletIdx >= 0
              ? resume.projects[rewriteModal.projIdx]?.bullets[rewriteModal.bulletIdx] || ""
              : ""
          }
          onClose={() =>
            setRewriteModal({ isOpen: false, type: null, expIdx: -1, projIdx: -1, bulletIdx: -1 })
          }
          onReplace={handleReplaceBullet}
        />
      )}
    </div>
  );
}

