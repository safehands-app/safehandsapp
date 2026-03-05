// Auto-generated TypeScript types for the SafeHands Supabase schema
// Regenerate with: npx supabase gen types typescript --project-id YOUR_ID > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type JobStatus = 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'COMPLETED';
export type JobPriority = 'normal' | 'high' | 'urgent';
export type UserRole = 'super-admin' | 'tenant-admin' | 'family' | 'field-executive' | 'supervisor' | 'vendor';
export type ExecStatus = 'Free' | 'On-Job';
export type PhotoType = 'before' | 'after';

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
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name: string;
                    role: UserRole;
                    region?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    role?: UserRole;
                    region?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
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

// Convenient shorthand row types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type JobPhoto = Database['public']['Tables']['job_photos']['Row'];
export type FieldExecutive = Database['public']['Tables']['field_executives']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Enriched job type with joined profile data (returned by views/RPC)
export type JobWithDetails = Job & {
    family: Pick<Profile, 'id' | 'name'> | null;
    assigned_exec: Pick<Profile, 'id' | 'name'> | null;
    supervisor: Pick<Profile, 'id' | 'name'> | null;
    before_photos: JobPhoto[];
    after_photos: JobPhoto[];
};
