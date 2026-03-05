-- ============================================================
-- SafeHands - Supabase Database Schema
-- Run this entire file in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Step 1: Create custom enum types
CREATE TYPE user_role AS ENUM (
  'super-admin', 'tenant-admin', 'family', 'field-executive', 'supervisor', 'vendor'
);
CREATE TYPE job_status AS ENUM (
  'REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'COMPLETED'
);
CREATE TYPE job_priority AS ENUM ('normal', 'high', 'urgent');
CREATE TYPE exec_status AS ENUM ('Free', 'On-Job');
CREATE TYPE photo_type AS ENUM ('before', 'after');

-- Step 1.5: Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'Active',
  subscription TEXT NOT NULL DEFAULT 'Standard',
  mrr          TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID REFERENCES tenants(id) ON DELETE SET NULL,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'family',
  region      TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type              TEXT NOT NULL,
  description       TEXT NOT NULL,
  status            job_status NOT NULL DEFAULT 'REQUESTED',
  priority          job_priority NOT NULL DEFAULT 'normal',
  family_id         UUID NOT NULL REFERENCES profiles(id),
  assigned_exec_id  UUID REFERENCES profiles(id),
  supervisor_id     UUID REFERENCES profiles(id),
  region            TEXT NOT NULL,
  notes             TEXT,
  requested_at      TIMESTAMPTZ DEFAULT NOW(),
  scheduled_at      TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Job photos table
CREATE TABLE IF NOT EXISTS job_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  type         photo_type NOT NULL,
  url          TEXT NOT NULL,
  caption      TEXT,
  uploaded_by  UUID NOT NULL REFERENCES profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Field executives table
CREATE TABLE IF NOT EXISTS field_executives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  region          TEXT NOT NULL,
  status          exec_status NOT NULL DEFAULT 'Free',
  current_job_id  UUID REFERENCES jobs(id),
  jobs_completed  INTEGER DEFAULT 0,
  rating          NUMERIC(3, 2) DEFAULT 5.0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',
  job_id      UUID REFERENCES jobs(id),
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Step 8: Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'family')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Step 9: Row Level Security (RLS)
-- ============================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_executives ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get current user's region
CREATE OR REPLACE FUNCTION current_user_region()
RETURNS TEXT AS $$
  SELECT region FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get current user's tenant
CREATE OR REPLACE FUNCTION current_user_tenant()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- tenants: super-admin reads all, users read their own tenant
CREATE POLICY "tenants_superadmin_all" ON tenants
  USING (current_user_role() = 'super-admin');

CREATE POLICY "tenants_self_read" ON tenants FOR SELECT
  USING (id = current_user_tenant());

-- profiles: users can read their own profile; super-admins read all; tenant-admins/supervisors read within tenant
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (
    id = auth.uid() 
    OR current_user_role() = 'super-admin'
    OR (current_user_role() IN ('tenant-admin', 'supervisor') AND tenant_id = current_user_tenant())
  );

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid() OR current_user_role() = 'super-admin');

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (
    id = auth.uid() 
    OR current_user_role() = 'super-admin'
    OR (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant())
  );

-- jobs: family sees own; FE sees assigned; supervisor sees region in tenant; tenant-admin sees in tenant; super-admin sees all
CREATE POLICY "jobs_select" ON jobs FOR SELECT
  USING (
    family_id = auth.uid()
    OR assigned_exec_id = auth.uid()
    OR current_user_role() = 'super-admin'
    OR (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant())
    OR (current_user_role() = 'supervisor' AND tenant_id = current_user_tenant() AND region = current_user_region())
  );

CREATE POLICY "jobs_insert" ON jobs FOR INSERT
  WITH CHECK (
    (family_id = auth.uid() AND current_user_role() = 'family' AND tenant_id = current_user_tenant())
    OR current_user_role() = 'super-admin'
  );

CREATE POLICY "jobs_update" ON jobs FOR UPDATE
  USING (
    (current_user_role() = 'supervisor' AND tenant_id = current_user_tenant() AND supervisor_id = auth.uid())
    OR (current_user_role() = 'field-executive' AND assigned_exec_id = auth.uid())
    OR (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant())
    OR current_user_role() = 'super-admin'
  );

-- job_photos: same visibility as the parent job
CREATE POLICY "job_photos_select" ON job_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_photos.job_id
        AND (
          j.family_id = auth.uid()
          OR j.assigned_exec_id = auth.uid()
          OR j.supervisor_id = auth.uid()
          OR current_user_role() = 'super-admin'
          OR (current_user_role() = 'tenant-admin' AND j.tenant_id = current_user_tenant())
        )
    )
  );

CREATE POLICY "job_photos_insert" ON job_photos FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- field_executives: supervisors and admins can read; FE reads own record
CREATE POLICY "field_executives_select" ON field_executives FOR SELECT
  USING (
    profile_id = auth.uid()
    OR current_user_role() IN ('super-admin', 'tenant-admin', 'supervisor')
  );

CREATE POLICY "field_executives_update" ON field_executives FOR UPDATE
  USING (current_user_role() IN ('super-admin', 'tenant-admin', 'supervisor'));

-- notifications: users see only their own
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- Step 10: Storage bucket for job photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "job_photos_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'job-photos' AND auth.role() = 'authenticated');

CREATE POLICY "job_photos_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'job-photos' AND auth.role() = 'authenticated');

-- ============================================================
-- Step 11: Seed test users (run AFTER creating them in Auth > Users)
-- ============================================================
-- After creating users in Supabase Auth dashboard with the matching emails,
-- update their roles and regions using the emails from AuthContext:
--
-- UPDATE profiles SET role = 'super-admin' WHERE email = 'admin@safehands.com';
-- UPDATE profiles SET role = 'tenant-admin', region = 'Mumbai North' WHERE email = 'admin@oakridge.com';
-- UPDATE profiles SET role = 'field-executive', region = 'Mumbai North' WHERE email = 'field@safehands.com';
-- UPDATE profiles SET role = 'vendor' WHERE email = 'vendor@acme.com';
-- UPDATE profiles SET role = 'supervisor', region = 'Mumbai North' WHERE email = 'supervisor@safehands.com';
-- UPDATE profiles SET role = 'family', region = 'Mumbai North' WHERE email = 'family@safehands.com';
