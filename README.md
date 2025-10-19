# Resume Editor

A modern, AI-powered resume builder built with Next.js 14, TypeScript, and Anthropic Claude. Create, edit, and export professional ATS-optimized resumes with optional AI-powered bullet point improvements.

## Features

- **100% Client-Side Editing** - No backend or database required
- **Import/Export JSON** - Save and load your resume data
- **Multiple Export Formats** - Export to DOCX and PDF
- **Live Preview** - See your changes in real-time
- **Multiple Templates** - Choose from Clean, Compact, or Modern styles
- **ATS Optimization** - Built-in linting rules for ATS compliance
- **AI-Powered Rewriting** - Optional bullet point improvements using Anthropic Claude Sonnet 4.5
- **Offline Capable** - Works fully offline when AI is disabled

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **AI**: Anthropic Claude Sonnet 4.5 via @anthropic-ai/sdk
- **Export**: docx, pdf-lib

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Resume Editor"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (for AI features):
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Basic Editing

1. **Select a Section** - Click on any section in the left sidebar (Basic Info, Experience, Education, Skills, Projects)
2. **Edit Content** - Fill in the form fields in the middle panel
3. **Live Preview** - See your changes immediately in the right panel

### Import/Export

- **Import JSON**: Click "Import JSON" to load a previously saved resume
- **Download JSON**: Click "Download JSON" to save your resume
- **Export DOCX**: Click "Export DOCX" to download a Word document
- **Export PDF**: Click "Export PDF" to print/save as PDF

### AI Features

1. **Enable AI**: Click "AI: OFF" in the toolbar to enable AI features
2. **Improve Bullets**: Click the "Improve" button next to any bullet point
3. **Review Suggestions**: Choose from 2-3 AI-generated alternatives
4. **Replace or Copy**: Click "Replace" to update the bullet or "Copy" to copy it

**Note**: Only the bullet text is sent to Anthropic Claude. No personal data is stored.

### Templates

Choose from three professionally designed templates:
- **Clean** - Classic single-column layout
- **Compact** - Space-efficient design
- **Modern** - Contemporary style with accent colors

### Resume Quality Checker

The built-in ATS linter checks for:
- Missing required fields
- Bullet point length (20-150 characters)
- Passive voice usage
- Missing metrics/numbers
- Date formatting

## Resume JSON Schema

```json
{
  "version": "1.0",
  "basics": {
    "name": "string",
    "title": "string",
    "location": "string",
    "contact": {
      "email": "string",
      "phone": "string",
      "links": ["string"]
    },
    "summary": "string"
  },
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "start": "YYYY-MM",
      "end": "YYYY-MM or Present",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "graduation": "YYYY"
    }
  ],
  "skills": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "link": "string"
    }
  ]
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your `ANTHROPIC_API_KEY` environment variable
4. Deploy!

The app is optimized for Vercel with:
- Edge Functions for AI API routes
- Automatic HTTPS
- Global CDN
- Zero configuration

### Other Platforms

For other platforms, ensure:
- Node.js 18+ runtime
- Environment variables support
- Edge function support (for AI features)

## Privacy & Security

- **No Data Storage**: All resume data is stored locally in your browser
- **Optional AI**: AI features are opt-in and can be disabled entirely
- **Minimal Data Sharing**: Only bullet point text is sent to Anthropic when using AI features
- **No Tracking**: No analytics or tracking scripts

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on GitHub.

---

Built with Next.js and Anthropic Claude

