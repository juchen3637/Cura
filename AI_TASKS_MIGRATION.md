# AI Task Queue Migration

This migration adds persistent task queue storage to the database.

## Steps to Apply Migration

### Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `lib/supabase/migration_add_ai_tasks.sql`
4. Paste into the SQL Editor and run the query

## What This Migration Does

- Creates `ai_tasks` table to store AI workspace tasks persistently
- Adds indexes for performance
- Enables Row Level Security
- Sets up policies for user access

## Features Enabled

After running this migration, the AI workspace will:
- **Persist tasks** across page navigations and browser sessions
- **Process tasks in background** even when you're on other pages
- **Save all task information** including job title, company, and results
- **Maintain task history** so you can review completed tasks anytime

## Database Schema

```sql
ai_tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  mode TEXT ('analyze' | 'build'),
  job_title TEXT,
  company TEXT,
  job_description TEXT,
  resume_data JSONB,
  status TEXT ('pending' | 'running' | 'completed' | 'failed'),
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```
