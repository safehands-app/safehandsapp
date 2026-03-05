import { useState, useEffect, useCallback } from 'react';
import { getJobs, subscribeToJobUpdates, subscribeToNewJobs } from '../services/jobService';
import type { JobWithDetails, JobStatus } from '../lib/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseJobsOptions {
    status?: JobStatus;
    familyId?: string;
    execId?: string;
    supervisorId?: string;
    region?: string;
    /** Enable real-time updates */
    realtime?: boolean;
}

interface UseJobsResult {
    jobs: JobWithDetails[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useJobs(options: UseJobsOptions = {}): UseJobsResult {
    const [jobs, setJobs] = useState<JobWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getJobs(options);
            setJobs(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.status, options.familyId, options.execId, options.supervisorId, options.region]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Real-time subscriptions
    useEffect(() => {
        if (!options.realtime) return;

        const channels: RealtimeChannel[] = [];

        // Subscribe to updates on each loaded job
        jobs.forEach(job => {
            const ch = subscribeToJobUpdates(job.id, (updatedJob) => {
                setJobs(prev => prev.map(j => j.id === updatedJob.id ? { ...j, ...updatedJob } : j));
            });
            channels.push(ch);
        });

        // Subscribe to new jobs in region
        if (options.region) {
            const ch = subscribeToNewJobs(options.region, () => {
                fetchJobs(); // Refetch to get new job with all joins
            });
            channels.push(ch);
        }

        return () => {
            channels.forEach(ch => ch.unsubscribe());
        };
    }, [jobs, options.realtime, options.region, fetchJobs]);

    return { jobs, loading, error, refetch: fetchJobs };
}
