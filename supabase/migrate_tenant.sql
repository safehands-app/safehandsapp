-- ============================================================
-- SafeHands Migration: Phase 13 True Multi-Tenant SaaS
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'Active',
  subscription TEXT NOT NULL DEFAULT 'Standard',
  mrr          TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Security for tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 2. Add tenant_id to existing profiles and jobs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- 3. Create the tenant helper function
CREATE OR REPLACE FUNCTION current_user_tenant()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. Create Tenant Policies
DROP POLICY IF EXISTS "tenants_superadmin_all" ON tenants;
DROP POLICY IF EXISTS "tenants_self_read" ON tenants;

CREATE POLICY "tenants_superadmin_all" ON tenants
  USING (current_user_role() = 'super-admin');

CREATE POLICY "tenants_self_read" ON tenants FOR SELECT
  USING (id = current_user_tenant());

-- 5. Update Profile Policies
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

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

-- 6. Update Job Policies
DROP POLICY IF EXISTS "jobs_family_select" ON jobs;
DROP POLICY IF EXISTS "jobs_select" ON jobs;
DROP POLICY IF EXISTS "jobs_family_insert" ON jobs;
DROP POLICY IF EXISTS "jobs_insert" ON jobs;
DROP POLICY IF EXISTS "jobs_update" ON jobs;

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

-- 7. Update Job Photos Policies
DROP POLICY IF EXISTS "job_photos_select" ON job_photos;

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

-- 8. Add update trigger for tenants
DROP TRIGGER IF EXISTS tenants_updated_at ON tenants;
CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- End of Migration
