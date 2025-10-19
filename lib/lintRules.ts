import { Resume, LintIssue } from "@/types/resume";

const MAX_BULLET_LENGTH = 150;
const MIN_BULLET_LENGTH = 20;

export function lintResume(resume: Resume): LintIssue[] {
  const issues: LintIssue[] = [];

  // Check basics
  if (!resume.basics.name.trim()) {
    issues.push({
      section: "Basics",
      message: "Name is required",
      severity: "error",
    });
  }

  if (!resume.basics.title.trim()) {
    issues.push({
      section: "Basics",
      message: "Professional title is recommended",
      severity: "warning",
    });
  }

  if (!resume.basics.contact.email.trim()) {
    issues.push({
      section: "Basics",
      message: "Email is required",
      severity: "error",
    });
  }

  if (!resume.basics.contact.phone.trim()) {
    issues.push({
      section: "Basics",
      message: "Phone number is recommended",
      severity: "warning",
    });
  }

  // Check experience
  resume.experience.forEach((exp, idx) => {
    if (!exp.company.trim()) {
      issues.push({
        section: `Experience #${idx + 1}`,
        message: "Company name is required",
        severity: "error",
      });
    }

    if (!exp.role.trim()) {
      issues.push({
        section: `Experience #${idx + 1}`,
        message: "Role/title is required",
        severity: "error",
      });
    }

    if (!exp.start.trim() || !exp.end.trim()) {
      issues.push({
        section: `Experience #${idx + 1}`,
        message: "Start and end dates are required",
        severity: "error",
      });
    }

    if (exp.bullets.length === 0) {
      issues.push({
        section: `Experience #${idx + 1}`,
        message: "At least one bullet point is recommended",
        severity: "warning",
      });
    }

    exp.bullets.forEach((bullet, bulletIdx) => {
      if (bullet.length > MAX_BULLET_LENGTH) {
        issues.push({
          section: `Experience #${idx + 1}, Bullet #${bulletIdx + 1}`,
          message: `Bullet is too long (${bullet.length} chars, max ${MAX_BULLET_LENGTH})`,
          severity: "warning",
        });
      }

      if (bullet.length < MIN_BULLET_LENGTH && bullet.length > 0) {
        issues.push({
          section: `Experience #${idx + 1}, Bullet #${bulletIdx + 1}`,
          message: `Bullet is too short (${bullet.length} chars, min ${MIN_BULLET_LENGTH})`,
          severity: "warning",
        });
      }

      // Check for passive voice indicators
      const passiveIndicators = [
        "was",
        "were",
        "been",
        "being",
        "is",
        "are",
      ];
      const lowerBullet = bullet.toLowerCase();
      if (passiveIndicators.some((word) => lowerBullet.includes(` ${word} `))) {
        issues.push({
          section: `Experience #${idx + 1}, Bullet #${bulletIdx + 1}`,
          message: "Consider using active voice instead of passive",
          severity: "warning",
        });
      }

      // Check for missing numbers/metrics
      if (!/\d/.test(bullet)) {
        issues.push({
          section: `Experience #${idx + 1}, Bullet #${bulletIdx + 1}`,
          message: "Consider adding quantifiable metrics or numbers",
          severity: "warning",
        });
      }
    });
  });

  // Check education
  if (resume.education.length === 0) {
    issues.push({
      section: "Education",
      message: "At least one education entry is recommended",
      severity: "warning",
    });
  }

  resume.education.forEach((edu, idx) => {
    if (!edu.institution.trim()) {
      issues.push({
        section: `Education #${idx + 1}`,
        message: "Institution name is required",
        severity: "error",
      });
    }

    if (!edu.degree.trim()) {
      issues.push({
        section: `Education #${idx + 1}`,
        message: "Degree is required",
        severity: "error",
      });
    }

    if (!edu.graduation.trim()) {
      issues.push({
        section: `Education #${idx + 1}`,
        message: "Graduation year is required",
        severity: "error",
      });
    }
  });

  // Check skills
  if (resume.skills.length === 0) {
    issues.push({
      section: "Skills",
      message: "Adding skills is recommended",
      severity: "warning",
    });
  }

  return issues;
}

