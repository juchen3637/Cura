-- Add location, phone, and links fields to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb;

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, location, phone, links)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    NULL,
    NULL,
    '[]'::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
