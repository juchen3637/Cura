# Suggested Commands

## Development Commands

### Start Development Server
```bash
npm run dev
```
Opens development server at http://localhost:3000 with hot reload enabled.

### Build for Production
```bash
npm run build
```
Creates optimized production build in `.next/` directory.

### Start Production Server
```bash
npm start
```
Starts the production server (requires build first).

### Linting
```bash
npm run lint
```
Runs ESLint with Next.js configuration to check for code issues.

## Git Commands (Darwin/macOS)
Standard git commands work on this system:
```bash
git status
git add .
git commit -m "message"
git push
```

## File Operations (Darwin/macOS)
- `ls` - List files
- `cd` - Change directory
- `grep` - Search in files
- `find` - Find files

## Environment Setup

### Required for AI Features
Create `.env.local` file with:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

### Install Dependencies
```bash
npm install
```

## Testing
Currently, there is no test suite configured. The project relies on:
- TypeScript type checking
- ESLint for code quality
- Manual testing in browser

## Common Development Tasks

### Check TypeScript Errors
```bash
npx tsc --noEmit
```
Type checks without emitting files.

### Format Check (if using Prettier)
No Prettier configuration detected in this project currently.

## Deployment
Optimized for Vercel deployment:
1. Push to GitHub
2. Import on Vercel
3. Add `ANTHROPIC_API_KEY` environment variable
4. Deploy automatically
