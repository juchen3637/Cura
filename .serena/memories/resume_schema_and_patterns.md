# Resume Schema and Design Patterns

## Resume JSON Schema

The core data structure for resumes follows this schema:

```typescript
interface Resume {
  version: string;          // e.g., "1.0"
  basics: ResumeBasics;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
}

interface ResumeBasics {
  name: string;
  title: string;
  location: string;
  contact: ResumeContact;
  summary: string;
}

interface ResumeContact {
  email: string;
  phone: string;
  links: string[];
}

interface ResumeExperience {
  company: string;
  role: string;
  location: string;
  start: string;          // Format: "YYYY-MM"
  end: string;            // Format: "YYYY-MM" or "Present"
  bullets: string[];
}

interface ResumeEducation {
  institution: string;
  degree: string;
  graduation: string;     // Format: "YYYY"
}

interface ResumeProject {
  name: string;
  description: string;
  link: string;
}
```

## Template System

Three templates available with different styles:

### 1. Clean (Default)
- Traditional LaTeX-style layout
- Black text, minimal color
- Generous spacing
- Best for: Traditional industries, academia

### 2. Compact
- Smaller fonts (text-sm, text-xs)
- Tighter spacing
- Fits more content
- Best for: Extensive experience, space constraints

### 3. Modern
- Blue color accents (blue-900, blue-700, blue-600)
- Thicker section dividers
- Contemporary feel
- Best for: Tech companies, startups

## Key Design Patterns

### State Management (Zustand)
- Single store in `store/resumeStore.ts`
- Client-side only, no persistence to server
- Local storage for browser persistence
- Actions for updating each section

### ATS Optimization Rules
The linting system (`lib/lintRules.ts`) checks for:
- Missing required fields
- Bullet point length (20-150 characters)
- Passive voice usage
- Missing metrics/numbers in bullets
- Date formatting consistency

### Skills Auto-Categorization
The `lib/skillsCategorizer.ts` automatically groups skills into:
1. **Languages**: Python, JavaScript, TypeScript, Java, C++, SQL, etc.
2. **Frameworks and Libraries**: React, Angular, Vue, Next.js, Django, etc.
3. **Developer Tools**: Git, Docker, AWS, PostgreSQL, Node.js, etc.

### AI Integration
- Optional feature (requires `ANTHROPIC_API_KEY`)
- API route: `/api/rewrite`
- Uses Claude Sonnet 4.5
- Sends only bullet point text (no PII)
- Returns 2-3 improved alternatives
- User can select or reject suggestions

### Export Functionality
Located in `lib/exporters/`:
- **JSON**: Native browser download
- **DOCX**: Using `docx` library
- **PDF**: Browser print-to-PDF functionality

## Component Architecture

### ResumePreview.tsx
- Renders resume based on selected template
- Reads from Zustand store
- Print-optimized CSS
- Responsive design

### ResumeForm.tsx
- Section-based editing
- React Hook Form for form state
- Validation for required fields
- Updates Zustand store on change

### RewriteModal.tsx
- AI bullet point improvement UI
- Modal overlay with suggestions
- Replace or copy functionality
- Error handling for API failures

## Date Formatting Standards
- Experience dates: "YYYY-MM" or "Present"
- Education graduation: "YYYY"
- Display format: "Jan 2023" or "2023"

## ATS Best Practices
- Single column layout
- Semantic HTML (h1, h2, h3, ul, li)
- No tables for layout
- No images or graphics
- Standard fonts (Georgia, Times New Roman)
- Bullet points use • character
- Consistent section headers (uppercase)
