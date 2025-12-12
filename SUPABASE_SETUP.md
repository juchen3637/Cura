# Supabase Setup Guide

## Phase 1 - Authentication & Infrastructure Setup

Follow these steps to set up Supabase for your application:

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New project"
5. Fill in:
   - **Project name**: `blank-resume-builder` (or your choice)
   - **Database password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing plan**: Free tier is fine to start
6. Click "Create new project"
7. Wait 1-2 minutes for project to be created

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon in sidebar)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → anon public)
   - **service_role key** (under "Project API keys" → service_role - click "Reveal" first)

## Step 3: Add Environment Variables

1. Open your `.env.local` file in the project root
2. Add these variables (replace with your actual values):

```env
# Existing
ANTHROPIC_API_KEY=your_existing_anthropic_key

# New Supabase variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:**
- Keep the `service_role` key secret - never commit to git
- The `NEXT_PUBLIC_` prefix makes variables available in browser
- Restart your dev server after adding these

## Step 4: Run Database Schema

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **New query**
3. Copy the entire contents of `/lib/supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** button
6. You should see "Success. No rows returned" - this is correct!

**Verify Setup:**
- Go to **Database** → **Tables** in sidebar
- You should see these tables:
  - profiles
  - experiences
  - education
  - projects
  - skill_categories
  - resumes
  - suggestions

## Step 5: Configure Auth Settings

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add these URLs:
   - **Site URL**: `http://localhost:3001` (for development)
   - **Redirect URLs**: Add `http://localhost:3001/auth/callback`

For production (later):
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: `https://yourdomain.com/auth/callback`

3. Save changes

## Step 6: Test Authentication

1. Make sure your `.env.local` has all three Supabase variables
2. Restart your dev server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:3001`
4. Click "Sign up" in the navigation
5. Create a test account with your email
6. You should be redirected to `/dashboard` after signup

## Troubleshooting

### "Invalid API key" error
- Double-check your environment variables
- Make sure you copied the full keys (they're long!)
- Restart dev server after adding variables

### "Failed to create account" error
- Check Supabase project is running (not paused)
- Verify Site URL and Redirect URLs are configured
- Check browser console for detailed error messages

### "Cannot read properties of undefined"
- Make sure database schema was run successfully
- Verify tables exist in Database → Tables
- Check that RLS policies were created

### Redirects not working
- Verify `/middleware.ts` was created
- Check that auth callback route exists at `/app/auth/callback/route.ts`
- Clear browser cache and cookies

## Next Steps

Once authentication is working:
1. **Phase 2**: Profile Management System (create dashboard, profile pages)
2. **Phase 3**: AI Curated Resume Builder
3. **Phase 4**: Enhanced Inline Suggestions Queue

## Current Files Created

✅ Authentication infrastructure:
- `/lib/supabase/client.ts` - Browser client
- `/lib/supabase/server.ts` - Server client
- `/lib/supabase/middleware.ts` - Session management
- `/lib/supabase/schema.sql` - Database schema
- `/middleware.ts` - Route protection
- `/types/database.ts` - TypeScript types
- `/app/auth/login/page.tsx` - Login page
- `/app/auth/signup/page.tsx` - Signup page
- `/app/auth/callback/route.ts` - OAuth callback
- `/components/Navigation.tsx` - Updated with auth

✅ Dependencies installed:
- `@supabase/supabase-js@^2.39.0`
- `@supabase/ssr@^0.5.2`
- `@tanstack/react-query@^5.17.0`
