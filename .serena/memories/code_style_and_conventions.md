# Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled (`strict: true`)
- **ES Module Interop**: Enabled
- **Module Resolution**: Bundler
- **JSX**: Preserve (handled by Next.js)
- **No Emit**: True (Next.js handles compilation)

## Naming Conventions
- **Components**: PascalCase (e.g., `ResumePreview.tsx`)
- **Files**: camelCase for utilities (e.g., `lintRules.ts`)
- **Types/Interfaces**: PascalCase (e.g., `Resume`, `ResumeBasics`)
- **Functions**: camelCase (e.g., `formatDate`, `categorizeSkills`)
- **Constants**: UPPER_SNAKE_CASE for true constants

## Code Organization
- **One component per file**: Each React component in its own file
- **Co-located types**: Type definitions in `types/` directory
- **Utility functions**: Organized in `lib/` directory
- **API routes**: Follow Next.js App Router structure in `app/api/`

## React/Next.js Patterns
- **Server Components**: Default for app router pages
- **Client Components**: Marked with `'use client'` directive when needed
- **Hooks**: React Hook Form for forms, custom hooks when appropriate
- **State Management**: Zustand for global state

## Styling
- **Tailwind CSS**: Utility-first CSS framework
- **No CSS Modules**: Use Tailwind classes directly
- **Responsive Design**: Mobile-first approach
- **Custom Colors**: Defined in tailwind.config.ts using CSS variables

## TypeScript Guidelines
- Always define explicit types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type - use `unknown` if type is truly unknown
- Leverage type inference where appropriate

## Import Order
1. External dependencies (e.g., React, Next.js)
2. Internal imports with `@/` alias
3. Relative imports
4. Type-only imports

## Design Principles (from STYLE_GUIDE.md)
- **LaTeX-style typography**: Georgia, Times New Roman
- **ATS-optimized layout**: Single column, semantic HTML
- **Professional formatting**: Consistent spacing, right-aligned dates
- **Template system**: Clean, Compact, Modern templates
