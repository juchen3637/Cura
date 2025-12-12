# Task Completion Checklist

When completing a coding task in this project, follow these steps:

## 1. Code Quality Checks

### TypeScript Type Checking
```bash
npx tsc --noEmit
```
Ensure no TypeScript errors are introduced.

### Linting
```bash
npm run lint
```
Fix any ESLint warnings or errors.

### Build Test
```bash
npm run build
```
Verify the project builds successfully without errors.

## 2. Manual Testing

### Start Development Server
```bash
npm run dev
```

### Test in Browser
- Navigate to http://localhost:3000
- Test the specific feature/fix implemented
- Check for console errors (browser DevTools)
- Verify responsive design (mobile, tablet, desktop)

### Test AI Features (if applicable)
- Ensure `.env.local` has `ANTHROPIC_API_KEY`
- Test AI rewriting functionality
- Verify error handling for API failures

### Test Export Features (if applicable)
- Test JSON import/export
- Test DOCX export
- Test PDF export (print functionality)

## 3. Code Review Checklist

- [ ] Code follows TypeScript strict mode requirements
- [ ] No `any` types introduced
- [ ] Proper error handling implemented
- [ ] Component props properly typed
- [ ] Tailwind classes used for styling (no inline styles)
- [ ] Accessibility considerations (semantic HTML, ARIA labels)
- [ ] No console.log statements left in code
- [ ] Import paths use `@/` alias where appropriate

## 4. ATS & Resume Quality (if applicable)

If changes affect resume rendering or export:
- [ ] Maintains single-column layout
- [ ] Uses semantic HTML
- [ ] No tables for layout
- [ ] Proper date formatting (YYYY-MM)
- [ ] Consistent spacing and typography
- [ ] Print styles work correctly

## 5. Documentation

- [ ] Update relevant .md files if architecture changed
- [ ] Add comments for complex logic
- [ ] Update type definitions if data structure changed

## 6. Git Commit

```bash
git add .
git commit -m "descriptive commit message"
```

## Notes

- **No Test Suite**: This project currently has no automated tests
- **System**: Running on Darwin (macOS)
- **Browser Testing**: Recommended browsers are Chrome, Firefox, Safari
- **AI Features**: Optional and should gracefully degrade if API key is missing
