# Profile Fields Migration

This migration adds location, phone, and links fields to the profiles table.

## Steps to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `lib/supabase/migration_add_profile_fields.sql`
4. Paste into the SQL Editor and run the query

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db reset  # This will reset your database and apply all migrations
```

Or manually run:

```bash
psql -h your-db-host -U postgres -d postgres -f lib/supabase/migration_add_profile_fields.sql
```

## What This Migration Does

- Adds `location` (TEXT) field to profiles table
- Adds `phone` (TEXT) field to profiles table
- Adds `links` (JSONB array) field to profiles table
- Updates the `handle_new_user()` function to include these fields

## After Migration

The profile page will now display and allow editing of:
- Location (e.g., "San Francisco, CA")
- Phone number (e.g., "(555) 123-4567")
- Multiple links (LinkedIn, GitHub, Portfolio, etc.)

All existing profiles will have these fields set to NULL or empty array, which will display as "Not set" in the UI.
