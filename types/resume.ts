export interface ResumeContact {
  email: string;
  phone: string;
  links: string[];
}

export interface ResumeBasics {
  name: string;
  title: string;
  location: string;
  contact: ResumeContact;
  summary: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  location: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM or Present
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  location: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM or Present
}

export interface ResumeProject {
  name: string;
  link: string;
  bullets: string[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface Resume {
  version: string;
  basics: ResumeBasics;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: SkillCategory[];
  projects: ResumeProject[];
}

export type TemplateStyle = "compact";

export interface LintIssue {
  section: string;
  message: string;
  severity: "warning" | "error";
}

