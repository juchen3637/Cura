# User Roles Setup

Cura supports three user roles with different permission levels:

## User Roles

### 1. **Guest**
- Can use the app without an account
- Resume data stored in browser only (localStorage)
- No cloud sync or saved resumes

### 2. **User** (Default)
- All signed-up users start as "user"
- Can save unlimited resumes to cloud
- Full access to profile and AI features
- Personal data stored in Supabase

### 3. **Admin**
- Full system access
- Can manage all users (future feature)
- Access to admin dashboard (future feature)
- Full privileges

## Setup Instructions

### 1. Run the Migration

First, run the user roles migration in your Supabase SQL Editor:

```sql
-- Copy and paste from lib/supabase/migration_add_user_roles.sql

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

### 2. Make Your Account Admin

After running the migration, make yourself an admin using the Supabase SQL Editor:

**Option 1: Using your email address**
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

**Option 2: Using your user ID**
```sql
-- First, find your user ID
SELECT id, email, full_name, role FROM profiles WHERE email = 'your-email@example.com';

-- Then update the role
UPDATE profiles
SET role = 'admin'
WHERE id = 'your-user-id-here';
```

**Option 3: Make the first user admin automatically**
```sql
-- This makes the oldest account an admin
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM profiles
  ORDER BY created_at ASC
  LIMIT 1
);
```

### 3. Verify Admin Access

After updating, refresh your browser and check the profile page. You should see your role is now "admin".

You can verify with this query:
```sql
SELECT email, full_name, role FROM profiles WHERE email = 'your-email@example.com';
```

## Using Roles in Code

### Check user role in components:
```typescript
import { useUserRole } from "@/lib/hooks/useUserRole";

function MyComponent() {
  const { role, isAdmin, isUser, isGuest } = useUserRole();

  if (isAdmin) {
    return <AdminPanel />;
  }

  if (isUser) {
    return <UserDashboard />;
  }

  return <GuestView />;
}
```

### Protect API routes:
```typescript
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  // Admin-only logic here
  return NextResponse.json({ success: true });
}
```

## Future Role-Based Features

Once roles are set up, you can implement:
- Admin dashboard for user management
- Usage analytics for admins
- Role-based feature access
- Premium features for specific roles
- Rate limiting based on role
