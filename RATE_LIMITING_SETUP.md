# Rate Limiting & User Roles Setup Guide

Complete setup guide for user roles and rate limiting in Cura.

## Quick Overview

### User Roles & Access

| Role    | Pages Access                  | AI Calls/Month | PDF Imports/Month |
|---------|-------------------------------|----------------|-------------------|
| Guest   | Resume Editor only            | None           | None              |
| User    | All pages                     | 30             | 100               |
| Admin   | All pages                     | 1000 (safety)  | 1000 (safety)     |

### Features by Role

**Guest (Not Signed In):**
- ✅ Use Resume Editor
- ✅ Export to PDF
- ❌ Cannot save resumes
- ❌ No AI Workspace access
- ❌ No profile/dashboard access
- Resume data stored in browser only (localStorage)

**User (Default for Sign-Ups):**
- ✅ All features
- ✅ Save unlimited resumes to cloud
- ✅ 30 AI calls per month (Analyze + Build combined)
- ✅ 100 PDF imports per month
- Usage resets monthly

**Admin:**
- ✅ All features
- ✅ 1000 AI calls per month (safety limit)
- ✅ 1000 PDF imports per month (abuse prevention)
- Safety limits prevent infinite loops

## Setup Instructions

### Step 1: Run User Roles Migration

In Supabase SQL Editor, run:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('guest', 'user', 'admin'));

UPDATE profiles SET role = 'user' WHERE role IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, location, phone, links, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    NULL,
    NULL,
    '[]'::jsonb,
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

### Step 2: Run Rate Limiting Migration

In Supabase SQL Editor, copy and run the entire contents of:
`lib/supabase/migration_add_rate_limiting.sql`

This creates:
- `rate_limits` table to track usage
- `check_rate_limit()` function to validate and increment counts
- `get_rate_limit_usage()` function to view current usage
- Automatic monthly reset logic

### Step 3: Make Yourself Admin

Run this SQL (replace with your email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Verify with:
```sql
SELECT email, full_name, role FROM profiles WHERE email = 'your-email@example.com';
```

### Step 4: Refresh Browser

Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to clear cache and load new permissions.

## How It Works

### AI Call Rate Limiting

**When a user adds a task to the queue:**
1. Task is added to database
2. When task starts processing, rate limit is checked
3. If limit exceeded, task fails with error message
4. If allowed, API call proceeds and counter increments
5. Both "Analyze" and "Build" count toward the same 30/month limit for users

**For Admins:**
- 1000 calls/month safety limit
- Prevents accidental infinite loops
- Still very generous for admin testing

### PDF Import Rate Limiting

**When uploading a PDF:**
1. Rate limit checked before parsing
2. Users: 100 imports/month (prevents abuse)
3. Admins: 1000 imports/month
4. Clear error message shown if exceeded

### Monthly Reset

- Limits reset automatically on the 1st of each month
- Based on `month_year` column (e.g., "2025-12")
- Old records can be cleaned up periodically

## Usage Display

The AI Workspace now shows:
- Current AI usage: "15 / 30"
- Progress bar (green → yellow → red)
- PDF import usage
- Reset date
- "Admin - Safety Limits" badge for admins

## Testing

### Test as User:
1. Sign up with a new account (auto-assigned "user" role)
2. Go to AI Workspace
3. See usage: "0 / 30"
4. Add 2-3 tasks
5. See counter increment
6. After 30 tasks, should see rate limit error

### Test as Admin:
1. Update your role to 'admin' in database
2. See usage: "X / 1000"
3. Can add many more tasks
4. Safety limit at 1000 prevents runaway scripts

### Test as Guest:
1. Open site in incognito (not signed in)
2. Only see: Home, Resume Editor
3. Can build resume but cannot save
4. "Sign up to Save" button appears
5. No access to Dashboard, AI Workspace, Profile

## Security Notes

- **RLS enabled** - Users can only see their own rate limits
- **Role checking** - Done server-side via database functions
- **Safety limits** - Even admins have 1000/month cap
- **Abuse prevention** - PDF imports limited to prevent spam
- **Guest isolation** - Guests can't abuse API calls (no access)
