-- Add is_active column to profiles to support suspend/enable from frontend
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
