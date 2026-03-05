import { supabase } from '../lib/supabase';
import type { Job, JobPhoto, JobStatus, JobWithDetails } from '../lib/database.types';

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getJobs(filters?: {
    status?: JobStatus;
    familyId?: string;
    execId?: string;
    supervisorId?: string;
    region?: string;
}) {
    let query = supabase
        .from('jobs')
        .select(`
      *,
      family:profiles!jobs_family_id_fkey(id, name),
      assigned_exec:profiles!jobs_assigned_exec_id_fkey(id, name),
      supervisor:profiles!jobs_supervisor_id_fkey(id, name),
      before_photos:job_photos(*)
    `)
        .order('requested_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.familyId) query = query.eq('family_id', filters.familyId);
    if (filters?.execId) query = query.eq('assigned_exec_id', filters.execId);
    if (filters?.supervisorId) query = query.eq('supervisor_id', filters.supervisorId);
    if (filters?.region) query = query.eq('region', filters.region);

    const { data, error } = await query;
    if (error) throw error;
    return data as JobWithDetails[];
}

export async function getJobById(id: string) {
    const { data, error } = await supabase
        .from('jobs')
        .select(`
      *,
      family:profiles!jobs_family_id_fkey(id, name),
      assigned_exec:profiles!jobs_assigned_exec_id_fkey(id, name),
      supervisor:profiles!jobs_supervisor_id_fkey(id, name),
      job_photos(*)
    `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as JobWithDetails;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createJob(payload: {
    type: string;
    description: string;
    priority?: Job['priority'];
    region: string;
    scheduled_at?: string;
}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('jobs')
        .insert({
            ...payload,
            family_id: user.id,
            status: 'REQUESTED',
        })
        .select()
        .single();

    if (error) throw error;
    return data as Job;
}

// ─── Assign ───────────────────────────────────────────────────────────────────

export async function assignJob(jobId: string, execId: string) {
    const { data, error } = await supabase
        .from('jobs')
        .update({ assigned_exec_id: execId, status: 'ASSIGNED' })
        .eq('id', jobId)
        .select()
        .single();

    if (error) throw error;

    // Update field executive status to On-Job
    await supabase
        .from('field_executives')
        .update({ status: 'On-Job', current_job_id: jobId })
        .eq('profile_id', execId);

    return data as Job;
}

// ─── Status updates ───────────────────────────────────────────────────────────

export async function updateJobStatus(
    jobId: string,
    status: JobStatus,
    notes?: string
) {
    const updatePayload: Partial<Job> = { status };
    if (notes !== undefined) updatePayload.notes = notes;
    if (status === 'COMPLETED') updatePayload.completed_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('jobs')
        .update(updatePayload)
        .eq('id', jobId)
        .select()
        .single();

    if (error) throw error;

    // If completed, free up the field executive
    if (status === 'COMPLETED' && data.assigned_exec_id) {
        await supabase
            .from('field_executives')
            .update({ status: 'Free', current_job_id: null })
            .eq('profile_id', data.assigned_exec_id);

        // Increment jobs_completed
        await supabase.rpc('increment_jobs_completed', {
            exec_profile_id: data.assigned_exec_id,
        });
    }

    return data as Job;
}

// ─── Photo upload ─────────────────────────────────────────────────────────────

export async function uploadJobPhoto(
    jobId: string,
    type: 'before' | 'after',
    file: File,
    caption?: string
): Promise<JobPhoto> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Upload file to Storage
    const ext = file.name.split('.').pop();
    const filePath = `${jobId}/${type}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('job-photos')
        .getPublicUrl(filePath);

    // 3. Insert record in job_photos table
    const { data, error } = await supabase
        .from('job_photos')
        .insert({
            job_id: jobId,
            type,
            url: publicUrl,
            caption: caption ?? file.name,
            uploaded_by: user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return data as JobPhoto;
}

// ─── Real-time subscription ───────────────────────────────────────────────────

export function subscribeToJobUpdates(
    jobId: string,
    onUpdate: (job: Job) => void
) {
    return supabase
        .channel(`job-${jobId}`)
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` },
            (payload) => onUpdate(payload.new as Job)
        )
        .subscribe();
}

export function subscribeToNewJobs(
    region: string,
    onInsert: (job: Job) => void
) {
    return supabase
        .channel(`new-jobs-${region}`)
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'jobs', filter: `region=eq.${region}` },
            (payload) => onInsert(payload.new as Job)
        )
        .subscribe();
}
