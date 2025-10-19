# Quick Start Guide

## 🚀 Get Running in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Add AI Key
Create `.env.local` in the root:
```
ANTHROPIC_API_KEY=your_key_here
```
Get your key from: https://console.anthropic.com/

### 3. Run the App
```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## 📋 First Resume in 5 Minutes

1. **Import Sample Data**
   - Click "📁 Import JSON"
   - Select `sample-resume.json`

2. **Edit Content**
   - Click "Basic Info" in left sidebar
   - Update name, email, phone

3. **Add Your Experience**
   - Click "Experience"
   - Edit or add new positions

4. **Try AI Rewriting** (if API key set)
   - Click "AI: OFF" to enable
   - Click "✨ Improve" on any bullet
   - Choose a suggestion

5. **Export Your Resume**
   - Click "📄 Export DOCX" for Word
   - Click "📑 Export PDF" to print/save

---

## 🎯 Key Features at a Glance

| Feature | Description | Button/Location |
|---------|-------------|-----------------|
| Import | Load saved resume | 📁 Import JSON |
| Save | Download resume data | 💾 Download JSON |
| DOCX | Export to Word | 📄 Export DOCX |
| PDF | Print to PDF | 📑 Export PDF |
| AI Assist | Improve bullets | ✨ Improve (when AI enabled) |
| Templates | Change style | Left sidebar → Template |
| Quality | Check ATS compliance | Left sidebar → Resume Quality |

---

## 📁 Project Structure

```
Resume Editor/
├── app/                    # Next.js App Router
│   ├── api/rewrite/       # AI endpoint
│   ├── page.tsx           # Main UI
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ResumeForm.tsx     # Editor
│   ├── ResumePreview.tsx  # Preview
│   └── RewriteModal.tsx   # AI modal
├── lib/                   # Utilities
│   ├── exporters/         # Export functions
│   ├── lintRules.ts       # ATS checker
│   └── anthropicClient.ts # AI client
├── store/                 # State management
└── types/                 # TypeScript types
```

---

## 🛠️ Common Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Run production server
npm run lint       # Check for errors
```

---

## 📚 Need More Help?

- **Getting Started**: See [GETTING_STARTED.md](GETTING_STARTED.md)
- **All Features**: See [FEATURES.md](FEATURES.md)
- **Deploy to Web**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Main Docs**: See [README.md](README.md)

---

## 🐛 Troubleshooting

**AI not working?**
- Set `ANTHROPIC_API_KEY` in `.env.local`
- Restart dev server

**Styles not loading?**
- Delete `.next` folder
- Run `npm run dev` again

**Build failing?**
- Check Node.js version (need 18+)
- Run `npm install` again

---

## 🎓 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **Tailwind**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Anthropic**: https://docs.anthropic.com

---

**Happy Resume Building!** 📝✨

