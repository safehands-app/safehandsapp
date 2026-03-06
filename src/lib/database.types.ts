// Auto-generated TypeScript types for the SafeHands Supabase schema
// Regenerate with: npx supabase gen types typescript --project-id YOUR_ID > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type JobStatus = 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'COMPLETED';
export type JobPriority = 'normal' | 'high' | 'urgent';
export type UserRole = 'super-admin' | 'tenant-admin' | 'family' | 'field-executive' | 'supervisor' | 'vendor';
export type ExecStatus = 'Free' | 'On-Job';
export type PhotoType = 'before' | 'after';
export type VisitStatus = 'pending' | 'in-progress' | 'completed';
export type MaintenanceStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'low' | 'normal' | 'high' | 'urgent';
export type WellbeingStatus = 'ok' | 'attention-required' | 'emergency';
export type ScheduleFrequency = 'once' | 'weekly' | 'biweekly' | 'monthly';
export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled';
export type VendorStatus = 'active' | 'inactive';

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    role: UserRole;
                    region: string | null;
                    tenant_id: string | null;
                    avatar_url: string | null;
                    is_active: boolean | null;
                    deleted_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name: string;
                    role: UserRole;
                    region?: string | null;
                    tenant_id?: string | null;
                    avatar_url?: string | null;
                    is_active?: boolean | null;
                    deleted_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    role?: UserRole;
                    region?: string | null;
                    tenant_id?: string | null;
                    avatar_url?: string | null;
                    is_active?: boolean | null;
                    deleted_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            tenants: {
                Row: {
                    id: string;
                    name: string;
                    address: string | null;
                    phone: string | null;
                    contact_email: string | null;
                    status: string;
                    subscription: string;
                    mrr: string | null;
                    deleted_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    address?: string | null;
                    phone?: string | null;
                    contact_email?: string | null;
                    status?: string;
                    subscription?: string;
                    mrr?: string | null;
                    deleted_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    address?: string | null;
                    phone?: string | null;
                    contact_email?: string | null;
                    status?: string;
                    subscription?: string;
                    mrr?: string | null;
                    deleted_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            tenant_settings: {
                Row: {
                    id: string;
                    tenant_id: string;
                    platform_name: string;
                    logo_url: string | null;
                    primary_color: string;
                    secondary_color: string;
                    footer_text: string | null;
                    support_email: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    tenant_id: string;
                    platform_name?: string;
                    logo_url?: string | null;
                    primary_color?: string;
                    secondary_color?: string;
                    footer_text?: string | null;
                    support_email?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    tenant_id?: string;
                    platform_name?: string;
                    logo_url?: string | null;
                    primary_color?: string;
                    secondary_color?: string;
                    footer_text?: string | null;
                    support_email?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            homes: {
                Row: {
                    id: string;
                    tenant_id: string;
                    owner_user_id: string;
                    address: string;
                    city: string;
                    state: string | null;
                    country: string;
                    notes: string | null;
                    elderly_present: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    tenant_id: string;
                    owner_user_id: string;
                    address: string;
                    city: string;
                    state?: string | null;
                    country?: string;
                    notes?: string | null;
                    elderly_present?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    tenant_id?: string;
                    owner_user_id?: string;
                    address?: string;
                    city?: string;
                    state?: string | null;
                    country?: string;
                    notes?: string | null;
                    elderly_present?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            vendors: {
                Row: {
                    id: string;
                    tenant_id: string;
                    profile_id: string | null;
                    name: string;
                    service_type: string;
                    phone: string | null;
                    email: string | null;
                    rating: number;
                    status: VendorStatus;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    tenant_id: string;
                    profile_id?: string | null;
                    name: string;
                    service_type: string;
                    phone?: string | null;
                    email?: string | null;
                    rating?: number;
                    status?: VendorStatus;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    tenant_id?: string;
                    profile_id?: string | null;
                    name?: string;
                    service_type?: string;
                    phone?: string | null;
                    email?: string | null;
                    rating?: number;
                    status?: VendorStatus;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            home_visits: {
                Row: {
                    id: string;
                    tenant_id: string;
                    home_id: string;
                    executive_id: string;
                    visit_date: string;
                    status: VisitStatus;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    tenant_id: string;
                    home_id: string;
                    executive_id: string;
                    visit_date?: string;
                    status?: VisitStatus;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    tenant_id?: string;
                    home_id?: string;
                    executive_id?: string;
                    visit_date?: string;
                    status?: VisitStatus;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            visit_photos: {
                Row: {
                    id: string;
                    visit_id: string;
                    url: string;
                    caption: string | null;
                    uploaded_by: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    visit_id: string;
                    url: string;
                    caption?: string | null;
                    uploaded_by: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    visit_id?: string;
                    url?: string;
                    caption?: string | null;
                    uploaded_by?: string;
                    created_at?: string;
                };
            };
            maintenance_requests: {
                Row: {
                    id: string;
                    tenant_id: string;
                    home_id: string;
                    requested_by: string;
                    description: string;
                    status: MaintenanceStatus;
                    assigned_vendor_id: string | null;
                    priority: MaintenancePriority;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    tenant_id: string;
                    home_id: string;
                    requested_by: string;
                    description: string;
                    status?: MaintenanceStatus;
                    assigned_vendor_id?: string | null;
                    priority?: MaintenancePriority;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    tenant_id?: string;
                    home_id?: string;
                    requested_by?: string;
                    description?: string;
                    status?: MaintenanceStatus;
                    assigned_vendor_id?: string | null;
                    priority?: MaintenancePriority;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            wellbeing_checks: {
                Row: {
                    id: string;
                    tenant_id: string;
                    home_id: string;
                    executive_id: string;
                    status: WellbeingStatus;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    tenant_id: string;
                    home_id: string;
                    executive_id: string;
                    status?: WellbeingStatus;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    tenant_id?: string;
                    home_id?: string;
                    executive_id?: string;
                    status?: WellbeingStatus;
                    notes?: string | null;
                    created_at?: string;
                };
            };
            visit_schedules: {
                Row: {
                    id: string;
                    tenant_id: string;
                    home_id: string;
                    executive_id: string | null;
                    scheduled_at: string;
                    frequency: ScheduleFrequency;
                    notes: string | null;
                    status: ScheduleStatus;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    tenant_id: string;
                    home_id: string;
                    executive_id?: string | null;
                    scheduled_at: string;
                    frequency?: ScheduleFrequency;
                    notes?: string | null;
                    status?: ScheduleStatus;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    tenant_id?: string;
                    home_id?: string;
                    executive_id?: string | null;
                    scheduled_at?: string;
                    frequency?: ScheduleFrequency;
                    notes?: string | null;
                    status?: ScheduleStatus;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            audit_logs: {
                Row: {
                    id: string;
                    tenant_id: string | null;
                    user_id: string | null;
                    action: string;
                    resource_type: string;
                    resource_id: string | null;
                    detail: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    tenant_id?: string | null;
                    user_id?: string | null;
                    action: string;
                    resource_type: string;
                    resource_id?: string | null;
                    detail?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    tenant_id?: string | null;
                    user_id?: string | null;
                    action?: string;
                    resource_type?: string;
                    resource_id?: string | null;
                    detail?: Json | null;
                    created_at?: string;
                };
            };
            jobs: {
                Row: {
                    id: string;
                    type: string;
                    description: string;
                    status: JobStatus;
                    priority: JobPriority;
                    family_id: string;
                    assigned_exec_id: string | null;
                    supervisor_id: string | null;
                    tenant_id: string | null;
                    region: string;
                    notes: string | null;
                    requested_at: string;
                    scheduled_at: string | null;
                    completed_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    type: string;
                    description: string;
                    status: JobStatus;
                    priority?: JobPriority;
                    family_id: string;
                    assigned_exec_id?: string | null;
                    supervisor_id?: string | null;
                    tenant_id?: string | null;
                    region: string;
                    notes?: string | null;
                    requested_at?: string;
                    scheduled_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    type?: string;
                    description?: string;
                    status?: JobStatus;
                    priority?: JobPriority;
                    family_id?: string;
                    assigned_exec_id?: string | null;
                    supervisor_id?: string | null;
                    tenant_id?: string | null;
                    region?: string;
                    notes?: string | null;
                    requested_at?: string;
                    scheduled_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            job_photos: {
                Row: {
                    id: string;
                    job_id: string;
                    type: PhotoType;
                    url: string;
                    caption: string | null;
                    uploaded_by: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    job_id: string;
                    type: PhotoType;
                    url: string;
                    caption?: string | null;
                    uploaded_by: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    job_id?: string;
                    type?: PhotoType;
                    url?: string;
                    caption?: string | null;
                    uploaded_by?: string;
                    created_at?: string;
                };
            };
            field_executives: {
                Row: {
                    id: string;
                    profile_id: string;
                    region: string;
                    status: ExecStatus;
                    current_job_id: string | null;
                    jobs_completed: number;
                    rating: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    profile_id: string;
                    region: string;
                    status: ExecStatus;
                    current_job_id?: string | null;
                    jobs_completed?: number;
                    rating?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    region?: string;
                    status?: ExecStatus;
                    current_job_id?: string | null;
                    jobs_completed?: number;
                    rating?: number;
                    created_at?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    tenant_id: string | null;
                    title: string;
                    message: string;
                    type: string;
                    job_id: string | null;
                    read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    tenant_id?: string | null;
                    title: string;
                    message: string;
                    type: string;
                    job_id?: string | null;
                    read?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    tenant_id?: string | null;
                    title?: string;
                    message?: string;
                    type?: string;
                    job_id?: string | null;
                    read?: boolean;
                    created_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            job_status: JobStatus;
            job_priority: JobPriority;
            user_role: UserRole;
            exec_status: ExecStatus;
            photo_type: PhotoType;
        };
    };
}

// ─── Convenient shorthand row types ──────────────────────────────────────────

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type TenantSettings = Database['public']['Tables']['tenant_settings']['Row'];
export type Home = Database['public']['Tables']['homes']['Row'];
export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type HomeVisit = Database['public']['Tables']['home_visits']['Row'];
export type VisitPhoto = Database['public']['Tables']['visit_photos']['Row'];
export type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];
export type WellbeingCheck = Database['public']['Tables']['wellbeing_checks']['Row'];
export type VisitSchedule = Database['public']['Tables']['visit_schedules']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type JobPhoto = Database['public']['Tables']['job_photos']['Row'];
export type FieldExecutive = Database['public']['Tables']['field_executives']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// ─── Enriched types ───────────────────────────────────────────────────────────

export type JobWithDetails = Job & {
    family: Pick<Profile, 'id' | 'name'> | null;
    assigned_exec: Pick<Profile, 'id' | 'name'> | null;
    supervisor: Pick<Profile, 'id' | 'name'> | null;
    before_photos: JobPhoto[];
    after_photos: JobPhoto[];
};

export type HomeVisitWithDetails = HomeVisit & {
    home: Pick<Home, 'id' | 'address' | 'city' | 'country'> | null;
    executive: Pick<Profile, 'id' | 'name'> | null;
    photos: VisitPhoto[];
};

export type MaintenanceRequestWithDetails = MaintenanceRequest & {
    home: Pick<Home, 'id' | 'address' | 'city'> | null;
    requester: Pick<Profile, 'id' | 'name'> | null;
    vendor: Pick<Vendor, 'id' | 'name' | 'service_type'> | null;
};

export type VisitScheduleWithDetails = VisitSchedule & {
    home: Pick<Home, 'id' | 'address' | 'city'> | null;
    executive: Pick<Profile, 'id' | 'name'> | null;
};
