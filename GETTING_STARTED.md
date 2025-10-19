# Getting Started with Resume Editor

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables (Optional - for AI features)

Create a `.env.local` file in the root directory:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from [Anthropic Console](https://console.anthropic.com/)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## First Time Usage

### Option 1: Start with Sample Data

1. Open the app
2. Click "📁 Import JSON"
3. Select `sample-resume.json` from the project root
4. Start editing!

### Option 2: Start from Scratch

1. Open the app
2. Click "Basic Info" in the left sidebar
3. Fill in your information
4. Navigate through other sections (Experience, Education, Skills, Projects)
5. Watch the live preview update on the right

## Key Features to Try

### ✨ AI-Powered Bullet Rewriting

1. Enable AI by clicking "AI: OFF" → "AI: ON" in the toolbar
2. Add some bullet points in the Experience section
3. Click "✨ Improve" next to any bullet
4. Review 2-3 AI-generated suggestions
5. Click "Replace" to update or "Copy" to copy the text

**Note**: Requires `ANTHROPIC_API_KEY` to be set.

### 📄 Export Your Resume

- **JSON**: Save your work and reload it later
- **DOCX**: Download a Microsoft Word document
- **PDF**: Use your browser's print function (Ctrl+P or Cmd+P)

### 🎨 Try Different Templates

Click on the template options in the left sidebar:
- **Clean**: Classic professional look
- **Compact**: Fit more content
- **Modern**: Contemporary design with color accents

### 🔍 Resume Quality Checker

Click "Resume Quality" in the left sidebar to see:
- Missing required fields
- Bullet points that are too long or too short
- Suggestions for active voice
- Recommendations for adding metrics

## Project Structure

```
Resume Editor/
├── app/
│   ├── api/rewrite/route.ts    # AI API endpoint
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application
├── components/
│   ├── ResumeForm.tsx           # Editing form
│   ├── ResumeModal.tsx          # AI suggestion modal
│   └── ResumePreview.tsx        # Live preview
├── lib/
│   ├── anthropicClient.ts       # AI client setup
│   ├── lintRules.ts             # ATS validation rules
│   └── exporters/
│       ├── docxExporter.ts      # DOCX export
│       └── pdfExporter.ts       # PDF & JSON utilities
├── store/
│   └── resumeStore.ts           # Zustand state management
├── types/
│   └── resume.ts                # TypeScript definitions
└── sample-resume.json           # Example resume
```

## Common Tasks

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Troubleshooting

### AI Features Not Working

- Check that `ANTHROPIC_API_KEY` is set in `.env.local`
- Restart the development server after adding the key
- Ensure you have API credits in your Anthropic account

### Exports Not Working

- **DOCX**: Should work offline
- **PDF**: Use browser print (Ctrl+P / Cmd+P) and "Save as PDF"

### Styles Not Loading

- Delete `.next` folder
- Run `npm run dev` again

## Next Steps

- Customize templates in `components/ResumePreview.tsx`
- Add more linting rules in `lib/lintRules.ts`
- Modify AI prompts in `app/api/rewrite/route.ts`
- Add new sections to the resume schema in `types/resume.ts`

## Support

For issues or questions:
- Check the main README.md
- Review the code comments
- Open an issue on GitHub

Happy resume building! 🚀

