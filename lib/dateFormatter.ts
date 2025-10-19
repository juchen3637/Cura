export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  // Handle "Present" case
  if (dateString.toLowerCase() === "present") {
    return "Present";
  }
  
  // Parse YYYY-MM format
  const [year, month] = dateString.split("-");
  
  if (!year || !month) return dateString;
  
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const monthIndex = parseInt(month, 10) - 1;
  
  if (monthIndex < 0 || monthIndex > 11) return dateString;
  
  return `${monthNames[monthIndex]} ${year}`;
}

export function formatDateRange(start: string, end: string): string {
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);
  
  if (!formattedStart && !formattedEnd) return "";
  if (!formattedStart) return formattedEnd;
  if (!formattedEnd) return formattedStart;
  
  return `${formattedStart} - ${formattedEnd}`;
}

