-- ============================================================
-- SafeHands Schema V2: Home Monitoring Architecture
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ─── 0. Extend existing tables ───────────────────────────────────────────────

-- Add extra columns to tenants
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS address       TEXT,
  ADD COLUMN IF NOT EXISTS phone         TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add tenant_id to notifications (gap fix)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- ─── 1. Tenant Branding/Settings ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenant_settings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  platform_name    TEXT NOT NULL DEFAULT 'SafeHands Portal',
  logo_url         TEXT,
  primary_color    TEXT NOT NULL DEFAULT '#2563eb',
  secondary_color  TEXT NOT NULL DEFAULT '#64748b',
  footer_text      TEXT,
  support_email    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_settings_admin_all" ON tenant_settings;
DROP POLICY IF EXISTS "tenant_settings_member_read" ON tenant_settings;

CREATE POLICY "tenant_settings_admin_all" ON tenant_settings
  USING (
    current_user_role() = 'super-admin'
    OR (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant())
  );

CREATE POLICY "tenant_settings_member_read" ON tenant_settings FOR SELECT
  USING (tenant_id = current_user_tenant());

DROP TRIGGER IF EXISTS tenant_settings_updated_at ON tenant_settings;
CREATE TRIGGER tenant_settings_updated_at
  BEFORE UPDATE ON tenant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. Homes ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS homes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  owner_user_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address        TEXT NOT NULL,
  city           TEXT NOT NULL,
  state          TEXT,
  country        TEXT NOT NULL DEFAULT 'India',
  notes          TEXT,
  elderly_present BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE homes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "homes_superadmin_all" ON homes;
DROP POLICY IF EXISTS "homes_tenant_admin_all" ON homes;
DROP POLICY IF EXISTS "homes_supervisor_read" ON homes;
DROP POLICY IF EXISTS "homes_family_own" ON homes;
DROP POLICY IF EXISTS "homes_exec_assigned" ON homes;

CREATE POLICY "homes_superadmin_all" ON homes
  USING (current_user_role() = 'super-admin');

CREATE POLICY "homes_tenant_admin_all" ON homes
  USING (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant());

CREATE POLICY "homes_supervisor_read" ON homes FOR SELECT
  USING (current_user_role() = 'supervisor' AND tenant_id = current_user_tenant());

CREATE POLICY "homes_family_own" ON homes
  USING (current_user_role() = 'family' AND owner_user_id = auth.uid());

CREATE POLICY "homes_exec_read" ON homes FOR SELECT
  USING (
    current_user_role() = 'field-executive' AND tenant_id = current_user_tenant()
  );

DROP TRIGGER IF EXISTS homes_updated_at ON homes;
CREATE TRIGGER homes_updated_at
  BEFORE UPDATE ON homes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 3. Vendors ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  service_type TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  rating       NUMERIC(3,2) DEFAULT 0.0,
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendors_superadmin_all" ON vendors;
DROP POLICY IF EXISTS "vendors_tenant_all" ON vendors;
DROP POLICY IF EXISTS "vendors_supervisor_read" ON vendors;
DROP POLICY IF EXISTS "vendors_self_read" ON vendors;

CREATE POLICY "vendors_superadmin_all" ON vendors
  USING (current_user_role() = 'super-admin');

CREATE POLICY "vendors_tenant_all" ON vendors
  USING (
    current_user_role() IN ('tenant-admin', 'supervisor')
    AND tenant_id = current_user_tenant()
  );

CREATE POLICY "vendors_exec_family_read" ON vendors FOR SELECT
  USING (
    current_user_role() IN ('field-executive', 'family')
    AND tenant_id = current_user_tenant()
  );

CREATE POLICY "vendors_self_read" ON vendors FOR SELECT
  USING (profile_id = auth.uid());

DROP TRIGGER IF EXISTS vendors_updated_at ON vendors;
CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 4. Home Visits ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS home_visits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  home_id       UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  executive_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  visit_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in-progress', 'completed')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE home_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "home_visits_superadmin_all" ON home_visits;
DROP POLICY IF EXISTS "home_visits_tenant_admin_all" ON home_visits;
DROP POLICY IF EXISTS "home_visits_supervisor_tenant" ON home_visits;
DROP POLICY IF EXISTS "home_visits_exec_own" ON home_visits;
DROP POLICY IF EXISTS "home_visits_family_read" ON home_visits;

CREATE POLICY "home_visits_superadmin_all" ON home_visits
  USING (current_user_role() = 'super-admin');

CREATE POLICY "home_visits_tenant_admin_all" ON home_visits
  USING (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant());

CREATE POLICY "home_visits_supervisor_tenant" ON home_visits FOR SELECT
  USING (current_user_role() = 'supervisor' AND tenant_id = current_user_tenant());

CREATE POLICY "home_visits_exec_own" ON home_visits
  USING (current_user_role() = 'field-executive' AND executive_id = auth.uid());

CREATE POLICY "home_visits_family_read" ON home_visits FOR SELECT
  USING (
    current_user_role() = 'family'
    AND EXISTS (
      SELECT 1 FROM homes h
      WHERE h.id = home_visits.home_id AND h.owner_user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS home_visits_updated_at ON home_visits;
CREATE TRIGGER home_visits_updated_at
  BEFORE UPDATE ON home_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 5. Visit Photos ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS visit_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id     UUID NOT NULL REFERENCES home_visits(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  caption      TEXT,
  uploaded_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visit_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "visit_photos_select" ON visit_photos;
DROP POLICY IF EXISTS "visit_photos_insert" ON visit_photos;

CREATE POLICY "visit_photos_select" ON visit_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM home_visits v
      JOIN homes h ON h.id = v.home_id
      WHERE v.id = visit_photos.visit_id
        AND (
          v.executive_id = auth.uid()
          OR h.owner_user_id = auth.uid()
          OR current_user_role() IN ('super-admin', 'tenant-admin', 'supervisor')
        )
    )
  );

CREATE POLICY "visit_photos_insert" ON visit_photos FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND current_user_role() = 'field-executive'
  );

-- ─── 6. Maintenance Requests ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  home_id            UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  requested_by       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  description        TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'assigned', 'in-progress', 'completed', 'cancelled')),
  assigned_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  priority           TEXT NOT NULL DEFAULT 'normal'
                       CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mreq_superadmin_all" ON maintenance_requests;
DROP POLICY IF EXISTS "mreq_tenant_admin_all" ON maintenance_requests;
DROP POLICY IF EXISTS "mreq_supervisor_tenant" ON maintenance_requests;
DROP POLICY IF EXISTS "mreq_family_own" ON maintenance_requests;
DROP POLICY IF EXISTS "mreq_vendor_assigned" ON maintenance_requests;

CREATE POLICY "mreq_superadmin_all" ON maintenance_requests
  USING (current_user_role() = 'super-admin');

CREATE POLICY "mreq_tenant_admin_all" ON maintenance_requests
  USING (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant());

CREATE POLICY "mreq_supervisor_tenant" ON maintenance_requests FOR SELECT
  USING (current_user_role() = 'supervisor' AND tenant_id = current_user_tenant());

CREATE POLICY "mreq_family_own" ON maintenance_requests
  USING (current_user_role() = 'family' AND requested_by = auth.uid());

CREATE POLICY "mreq_vendor_assigned" ON maintenance_requests FOR SELECT
  USING (
    current_user_role() = 'vendor'
    AND EXISTS (
      SELECT 1 FROM vendors v
      WHERE v.id = maintenance_requests.assigned_vendor_id AND v.profile_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS mreq_updated_at ON maintenance_requests;
CREATE TRIGGER mreq_updated_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 7. Wellbeing Checks ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wellbeing_checks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  home_id       UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  executive_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status        TEXT NOT NULL DEFAULT 'ok'
                  CHECK (status IN ('ok', 'attention-required', 'emergency')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wellbeing_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wellbeing_superadmin_all" ON wellbeing_checks;
DROP POLICY IF EXISTS "wellbeing_tenant_admin_all" ON wellbeing_checks;
DROP POLICY IF EXISTS "wellbeing_supervisor_read" ON wellbeing_checks;
DROP POLICY IF EXISTS "wellbeing_exec_own" ON wellbeing_checks;
DROP POLICY IF EXISTS "wellbeing_family_read" ON wellbeing_checks;

CREATE POLICY "wellbeing_superadmin_all" ON wellbeing_checks
  USING (current_user_role() = 'super-admin');

CREATE POLICY "wellbeing_tenant_admin_all" ON wellbeing_checks
  USING (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant());

CREATE POLICY "wellbeing_supervisor_read" ON wellbeing_checks FOR SELECT
  USING (current_user_role() = 'supervisor' AND tenant_id = current_user_tenant());

CREATE POLICY "wellbeing_exec_own" ON wellbeing_checks
  USING (current_user_role() = 'field-executive' AND executive_id = auth.uid());

CREATE POLICY "wellbeing_family_read" ON wellbeing_checks FOR SELECT
  USING (
    current_user_role() = 'family'
    AND EXISTS (
      SELECT 1 FROM homes h
      WHERE h.id = wellbeing_checks.home_id AND h.owner_user_id = auth.uid()
    )
  );

-- ─── 8. Visit Schedules ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS visit_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  home_id       UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  executive_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  frequency     TEXT NOT NULL DEFAULT 'once'
                  CHECK (frequency IN ('once', 'weekly', 'biweekly', 'monthly')),
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visit_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedules_superadmin_all" ON visit_schedules;
DROP POLICY IF EXISTS "schedules_tenant_admin_all" ON visit_schedules;
DROP POLICY IF EXISTS "schedules_supervisor_tenant" ON visit_schedules;
DROP POLICY IF EXISTS "schedules_exec_own" ON visit_schedules;
DROP POLICY IF EXISTS "schedules_family_read" ON visit_schedules;

CREATE POLICY "schedules_superadmin_all" ON visit_schedules
  USING (current_user_role() = 'super-admin');

CREATE POLICY "schedules_tenant_admin_all" ON visit_schedules
  USING (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant());

CREATE POLICY "schedules_supervisor_tenant" ON visit_schedules
  USING (current_user_role() = 'supervisor' AND tenant_id = current_user_tenant());

CREATE POLICY "schedules_exec_own" ON visit_schedules FOR SELECT
  USING (current_user_role() = 'field-executive' AND executive_id = auth.uid());

CREATE POLICY "schedules_family_read" ON visit_schedules FOR SELECT
  USING (
    current_user_role() = 'family'
    AND EXISTS (
      SELECT 1 FROM homes h
      WHERE h.id = visit_schedules.home_id AND h.owner_user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS schedules_updated_at ON visit_schedules;
CREATE TRIGGER schedules_updated_at
  BEFORE UPDATE ON visit_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 9. Audit Logs ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  detail        JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_superadmin_all" ON audit_logs;
DROP POLICY IF EXISTS "audit_tenant_admin_read" ON audit_logs;

CREATE POLICY "audit_superadmin_all" ON audit_logs
  USING (current_user_role() = 'super-admin');

CREATE POLICY "audit_tenant_admin_read" ON audit_logs FOR SELECT
  USING (current_user_role() = 'tenant-admin' AND tenant_id = current_user_tenant());

-- Audit logs are INSERT-only for app roles (no UPDATE/DELETE)
CREATE POLICY "audit_insert_allow" ON audit_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ─── 10. Supabase Storage Bucket for Visit Photos ─────────────────────────────
-- Run this separately in the Supabase Storage dashboard or via API.
-- Bucket name: visit-photos | Public: false | File size limit: 10MB
-- Policy: authenticated users with field-executive role can upload
-- Authenticated users can read if they have access to that visit

-- ─── Done ─────────────────────────────────────────────────────────────────────
