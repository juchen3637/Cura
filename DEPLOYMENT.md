# Deployment Guide

## Deploying to Vercel (Recommended)

Vercel is the recommended platform for deploying this Next.js application. It provides:
- Zero-configuration deployment
- Automatic HTTPS
- Edge Function support for AI features
- Global CDN
- Instant preview deployments

### Method 1: GitHub Integration (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add: `ANTHROPIC_API_KEY` = `your_api_key_here`
   - Save and redeploy

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes!

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variable**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```
   Enter your API key when prompted.

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Deploying to Other Platforms

### Netlify

1. **Build Configuration**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18+

2. **Environment Variables**
   Add `ANTHROPIC_API_KEY` in Site Settings → Environment Variables

3. **Note**: Edge Functions require Netlify Edge Functions setup

### AWS Amplify

1. **Connect Repository**
   - Connect your GitHub/GitLab repo
   - Amplify auto-detects Next.js

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   Add `ANTHROPIC_API_KEY` in Environment Variables section

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t resume-editor .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=your_key resume-editor
```

## Environment Variables

### Required for AI Features
- `ANTHROPIC_API_KEY` - Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com/)

### Optional
None currently. The app works fully offline without the API key (AI features disabled).

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] All pages are accessible
- [ ] Import/Export JSON works
- [ ] DOCX export works
- [ ] PDF export (print) works
- [ ] Template switching works
- [ ] AI features work (if enabled)
- [ ] Resume Quality checker displays correctly
- [ ] Mobile responsiveness is good

## Testing AI Integration

1. Enable AI in the toolbar
2. Add a bullet point in Experience section
3. Click "✨ Improve" button
4. Verify suggestions appear
5. Test Replace and Copy functions

## Performance Optimization

### Already Implemented
- Edge runtime for API routes
- Code splitting with Next.js
- Optimized bundle size
- CSS-in-JS with Tailwind

### Additional Recommendations
1. **Enable Caching**
   - Vercel automatically handles this
   
2. **Monitor Usage**
   - Check Anthropic API usage in dashboard
   - Set up billing alerts

3. **Rate Limiting**
   - Consider adding rate limiting for AI endpoint
   - Use Vercel Edge Config for rate limit storage

## Troubleshooting

### Build Fails
- Check Node.js version (18+ required)
- Clear cache: `rm -rf .next node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### AI Features Don't Work in Production
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API route logs in Vercel dashboard
- Ensure Edge runtime is supported

### Styles Look Different in Production
- Clear browser cache
- Verify Tailwind CSS is properly configured
- Check console for CSS loading errors

## Security Considerations

1. **API Key Protection**
   - Never commit `.env.local` to git (already in `.gitignore`)
   - Use environment variables in production
   - Rotate keys periodically

2. **CORS**
   - API routes are already protected by Next.js
   - No additional CORS configuration needed

3. **Data Privacy**
   - All data is client-side only
   - Only bullet text sent to Anthropic
   - No user data stored on servers

## Scaling

The application is stateless and scales automatically on Vercel:
- Edge Functions scale to zero when not in use
- Pay only for actual usage
- Global CDN ensures fast loading worldwide

## Cost Estimation

### Vercel
- **Free Tier**: Sufficient for personal use
- **Pro Tier ($20/mo)**: For commercial use with custom domains

### Anthropic API
- **Pay-per-use**: ~$0.003 per bullet rewrite
- **Budget**: Set spending limits in Anthropic console

### Example Monthly Costs
- 100 rewrites/month: ~$0.30
- 1000 rewrites/month: ~$3.00
- Vercel hosting: $0 (free tier) or $20 (pro)

## Monitoring

### Vercel Analytics (Free)
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking
Consider adding:
- [Sentry](https://sentry.io/) for error tracking
- [LogRocket](https://logrocket.com/) for session replay

## Support

For deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic Documentation](https://docs.anthropic.com/)

---

Happy deploying! 🚀

