import { Resume } from "@/types/resume";

export function exportToPdf(filename?: string) {
  // Set the document title temporarily for the PDF filename
  const originalTitle = document.title;
  
  if (filename) {
    // Clean the filename and add .pdf extension
    const cleanFilename = filename.replace(/[^a-zA-Z0-9\s\-_()]/g, "").trim();
    document.title = cleanFilename || "Resume";
  }
  
  // Use browser's print functionality for PDF export
  window.print();
  
  // Restore the original title after a brief delay
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}

export function downloadJson(resume: Resume, filename: string = "resume.json") {
  const json = JSON.stringify(resume, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function loadJson(file: File): Promise<Resume> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

