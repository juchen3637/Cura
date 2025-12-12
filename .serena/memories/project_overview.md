# Resume Editor - Project Overview

## Purpose
An AI-powered resume builder built with Next.js 14, TypeScript, and Anthropic Claude. The application allows users to create, edit, and export professional ATS-optimized resumes with optional AI-powered bullet point improvements.

## Key Features
- **100% Client-Side**: No backend or database required - all data stored locally in browser
- **Import/Export**: Save and load resume data as JSON
- **Multiple Export Formats**: DOCX and PDF export
- **Live Preview**: Real-time resume preview
- **Multiple Templates**: Clean, Compact, and Modern styles
- **ATS Optimization**: Built-in linting rules for ATS compliance
- **AI-Powered Rewriting**: Optional bullet point improvements using Anthropic Claude Sonnet 4.5
- **Offline Capable**: Works fully offline when AI is disabled

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **AI**: Anthropic Claude Sonnet 4.5 via @anthropic-ai/sdk
- **Export**: docx, pdf-lib

## Privacy & Security
- No data storage on servers
- AI features are opt-in
- Only bullet point text is sent to Anthropic when using AI features
- No analytics or tracking scripts
