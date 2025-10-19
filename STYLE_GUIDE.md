# Resume Style Guide

## Overview

The resume templates are designed to match professional LaTeX-style resumes with clean typography, proper spacing, and ATS-friendly formatting.

## Design Principles

### 1. **Typography**
- **Serif Fonts**: Georgia, Times New Roman for professional appearance
- **Font Hierarchy**: 
  - Name: 3xl (large, bold)
  - Section Headers: Small, bold, uppercase with letter-spacing
  - Company/Institution: Bold
  - Role/Degree: Italic
  - Body Text: Regular weight

### 2. **Layout**
- **Single Column**: ATS-optimized, easy to scan
- **Consistent Spacing**: Predictable margins and padding
- **Right-Aligned Dates**: Clean, professional look
- **Horizontal Rules**: Under section headers for clear separation

### 3. **Color Palette**
- **Clean Template**: Black text, minimal color (traditional)
- **Compact Template**: Optimized for space, similar to Clean
- **Modern Template**: Blue accents (blue-900, blue-700, blue-600)

## Template Comparison

### Clean (Default) - LaTeX Style
```
✓ Traditional serif typography
✓ Black horizontal rules under headers
✓ Right-aligned dates
✓ Generous spacing
✓ Professional and timeless
✓ Best for: Traditional industries, academia
```

### Compact
```
✓ Smaller fonts (text-sm, text-xs)
✓ Tighter spacing
✓ Same professional appearance
✓ Fits more content on one page
✓ Best for: Extensive experience, space constraints
```

### Modern
```
✓ Blue color accents
✓ Thicker section dividers (border-b-2)
✓ Contemporary feel while ATS-safe
✓ Best for: Tech companies, startups, creative roles
```

## Section Formatting

### Header
```
NAME (centered, large, bold)
Professional Title (centered, medium)
Location (centered, small)
Phone | Email | Links (centered, small, with separators)
```

### Education
```
EDUCATION (uppercase, underlined)

Institution Name                        Graduation Year
Degree in Major                         Location
```

### Experience
```
EXPERIENCE (uppercase, underlined)

Company Name                            Start - End Date
Job Title                               Location
• Achievement bullet point with metrics
• Another achievement bullet point
```

### Projects
```
PROJECTS (uppercase, underlined)

Project Name | project-link.com        Date Range
• Description of project and impact
```

### Skills
```
SKILLS (uppercase, underlined)

Languages: Python, JavaScript, TypeScript, C++
Frameworks and Libraries: React.js, Next.js, Angular
Developer Tools: Git, Docker, AWS, PostgreSQL
```

## Automatic Skills Categorization

The app automatically categorizes skills into three groups:

### Languages
Detected keywords: python, javascript, typescript, java, c++, c#, sql, etc.

### Frameworks and Libraries
Detected keywords: react, angular, vue, next, express, django, etc.

### Developer Tools
Everything else: git, docker, aws, postgresql, node.js, etc.

**Note**: You can manually order your skills array, and the categorizer will group them intelligently.

## Spacing Guidelines

### Margins
- Page: 40px (10 * 0.25rem)
- Sections: 20px between
- Items within sections: 14px

### Text Leading
- Body text: leading-relaxed (1.625)
- Tight for headers: standard

## ATS Optimization

### ✅ Do's
- Use semantic HTML (h1, h2, h3, ul, li)
- Single column layout
- Clear section headers
- Standard fonts (serif, sans-serif)
- Consistent date formatting (YYYY-MM)
- Bullet points with • character

### ❌ Don'ts
- No tables for layout
- No images or graphics
- No text in headers/footers
- No unusual fonts
- No columns (for main content)
- No text boxes

## Print Optimization

The CSS includes print-specific styles:

```css
@media print {
  - Hides everything except #resume-preview
  - Sets proper page margins (0.5in)
  - Uses letter size (8.5" x 11")
  - Ensures proper page breaks
}
```

## Customization Tips

### Changing Font
Edit `app/globals.css`:
```css
.font-serif {
  font-family: 'Your Font', Georgia, serif;
}
```

### Adjusting Spacing
Edit template styles in `components/ResumePreview.tsx`:
```typescript
section: "mb-5",  // Change this value
spacing: "mb-3.5", // And this
```

### Adding New Template
1. Add template name to `types/resume.ts`
2. Add case in `getTemplateStyles()`
3. Define all style properties
4. Add template to selector in `app/page.tsx`

## Best Practices

### Content
- **Quantify achievements**: Use numbers, percentages, dollar amounts
- **Action verbs**: Led, Developed, Implemented, Achieved
- **Be specific**: Name technologies, tools, frameworks
- **Keep bullets concise**: 1-2 lines, under 150 characters

### Formatting
- **Consistent dates**: Use YYYY-MM format everywhere
- **Parallel structure**: Start all bullets with verbs
- **Order matters**: Most recent/important first
- **White space**: Don't overcrowd, let it breathe

### Length
- **Entry level**: 1 page
- **Mid-career (3-10 years)**: 1-2 pages
- **Senior (10+ years)**: 2 pages max

## AI-Enhanced Bullets

When using AI rewriting:
- Original bullets are sent to Claude Sonnet 4.5
- AI generates 2-3 alternatives
- Focus on action-oriented, measurable outcomes
- Removes buzzwords and vague language
- You can edit AI suggestions before accepting

## Accessibility

### WCAG Compliance
- ✅ Semantic HTML structure
- ✅ Sufficient color contrast (4.5:1 minimum)
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ Responsive text sizing

## Browser Compatibility

Tested and optimized for:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Print to PDF on all browsers

---

For implementation details, see `components/ResumePreview.tsx`

