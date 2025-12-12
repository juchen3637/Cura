# Codebase Structure

## Root Directory
```
Resume Editor/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── rewrite/      # AI rewrite endpoint
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ResumePreview.tsx # Resume preview component
│   ├── ResumeForm.tsx    # Form component for editing
│   └── RewriteModal.tsx  # AI rewrite modal
├── store/                 # State management
│   └── resumeStore.ts    # Zustand store for resume data
├── lib/                   # Utility functions
│   ├── exporters/        # Export functionality (DOCX, PDF)
│   ├── anthropicClient.ts # Anthropic API client
│   ├── lintRules.ts      # ATS linting rules
│   ├── skillsCategorizer.ts # Skills auto-categorization
│   └── dateFormatter.ts  # Date formatting utilities
├── types/                 # TypeScript definitions
│   └── resume.ts         # Resume data types and interfaces
└── [config files]        # Various configuration files
```

## Key Files
- **app/page.tsx**: Main application entry point with editor UI
- **components/ResumePreview.tsx**: Template rendering and preview
- **store/resumeStore.ts**: Centralized state management with Zustand
- **types/resume.ts**: All TypeScript interfaces for resume data
- **lib/lintRules.ts**: ATS compliance checking rules

## Import Aliases
- `@/*` maps to the root directory (configured in tsconfig.json)
- Example: `import { Resume } from '@/types/resume'`

## Data Flow
1. User edits form in ResumeForm component
2. Changes saved to Zustand store (resumeStore.ts)
3. ResumePreview component reads from store and renders
4. Optional: AI rewrite sends bullet to /api/rewrite endpoint
5. Export functions read from store and generate DOCX/PDF
