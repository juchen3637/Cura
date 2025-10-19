import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  Packer,
} from "docx";
import { Resume } from "@/types/resume";

export async function exportToDocx(resume: Resume): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Name
          new Paragraph({
            text: resume.basics.name,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          // Title
          new Paragraph({
            text: resume.basics.title,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          // Contact Info
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun(resume.basics.contact.email),
              new TextRun(" | "),
              new TextRun(resume.basics.contact.phone),
              new TextRun(" | "),
              new TextRun(resume.basics.location),
            ],
          }),
          // Links
          ...(resume.basics.contact.links.length > 0
            ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                  children: resume.basics.contact.links.map(
                    (link, idx) =>
                      new TextRun(
                        idx === 0
                          ? link
                          : ` | ${link}`
                      )
                  ),
                }),
              ]
            : []),
          // Summary
          ...(resume.basics.summary
            ? [
                new Paragraph({
                  text: "SUMMARY",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 100 },
                  underline: { type: UnderlineType.SINGLE },
                }),
                new Paragraph({
                  text: resume.basics.summary,
                  spacing: { after: 200 },
                }),
              ]
            : []),
          // Experience
          ...(resume.experience.length > 0
            ? [
                new Paragraph({
                  text: "EXPERIENCE",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 100 },
                  underline: { type: UnderlineType.SINGLE },
                }),
                ...resume.experience.flatMap((exp) => [
                  new Paragraph({
                    spacing: { after: 50 },
                    children: [
                      new TextRun({ text: exp.company, bold: true }),
                      new TextRun(` | ${exp.role}`),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 100 },
                    children: [
                      new TextRun(exp.location),
                      new TextRun(` | ${exp.start} - ${exp.end}`),
                    ],
                  }),
                  ...exp.bullets.map(
                    (bullet) =>
                      new Paragraph({
                        text: `• ${bullet}`,
                        spacing: { after: 50, left: 360 },
                      })
                  ),
                  new Paragraph({ spacing: { after: 100 } }),
                ]),
              ]
            : []),
          // Education
          ...(resume.education.length > 0
            ? [
                new Paragraph({
                  text: "EDUCATION",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 100 },
                  underline: { type: UnderlineType.SINGLE },
                }),
                ...resume.education.map(
                  (edu) =>
                    new Paragraph({
                      spacing: { after: 100 },
                      children: [
                        new TextRun({ text: edu.institution, bold: true }),
                        new TextRun(` | ${edu.degree} | ${edu.graduation}`),
                      ],
                    })
                ),
              ]
            : []),
          // Skills
          ...(resume.skills.length > 0
            ? [
                new Paragraph({
                  text: "SKILLS",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 100 },
                  underline: { type: UnderlineType.SINGLE },
                }),
                new Paragraph({
                  text: resume.skills.join(" • "),
                  spacing: { after: 200 },
                }),
              ]
            : []),
          // Projects
          ...(resume.projects.length > 0
            ? [
                new Paragraph({
                  text: "PROJECTS",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 100 },
                  underline: { type: UnderlineType.SINGLE },
                }),
                ...resume.projects.flatMap((proj) => [
                  new Paragraph({
                    spacing: { after: 50 },
                    children: [
                      new TextRun({ text: proj.name, bold: true }),
                      ...(proj.link ? [new TextRun(` | ${proj.link}`)] : []),
                    ],
                  }),
                  new Paragraph({
                    text: proj.description,
                    spacing: { after: 100 },
                  }),
                ]),
              ]
            : []),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadDocx(blob: Blob, filename: string = "resume.docx") {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

