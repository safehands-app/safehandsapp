import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';

export type Role = Profile['role'] | null;

interface User {
    id: string;
    email: string;
    role: Role;
    name: string;
    region: string | null;
    initials: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function makeInitials(name: string) {
    const parts = name.trim().split(' ');
    return parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();
}

function profileToUser(profile: Profile): User {
    return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name,
        region: profile.region,
        initials: makeInitials(profile.name),
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // On mount — restore session from Supabase (handles refresh tokens automatically)
    useEffect(() => {
        // Get existing session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                await loadProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                console.log('[AuthContext] onAuthStateChange event:', _event, 'session:', session?.user?.id);
                setSession(session);
                if (session?.user) {
                    try {
                        console.log('[AuthContext] onAuthStateChange calling loadProfile');
                        await loadProfile(session.user.id);
                    } catch (err) {
                        console.error("Background profile sync failed:", err);
                        setUser(null);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setUser(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function loadProfile(userId: string) {
        console.log('[AuthContext] loadProfile START for user:', userId);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[AuthContext] loadProfile error:', error);
            throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
        }
        if (!data) {
            console.error('[AuthContext] loadProfile no data found');
            throw new Error('Your account profile does not exist in the database. Please contact support.');
        }

        console.log('[AuthContext] loadProfile SUCCESS:', data);
        setUser(profileToUser(data as Profile));
    }

    const login = async (email: string, password: string) => {
        console.log('[AuthContext] login START');
        setLoading(true);
        try {
            console.log('[AuthContext] Calling supabase.auth.signInWithPassword...');
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            console.log('[AuthContext] supabase.auth.signInWithPassword returned, error:', error);
            if (error) throw new Error(error.message);

            // We NO LONGER call `loadProfile` explicitly here to avoid the race condition
            // where `signInWithPassword` and `onAuthStateChange` fight over the LocalStorage lock.
            // The `onAuthStateChange` subscription defined in the `useEffect` above will automatically 
            // fire once the sign-in completes, acting as the singular source of truth for fetching the profile.
            console.log('[AuthContext] login function FINISHED');
        } finally {
            // we do NOT set loading to false here. We let the onAuthStateChange listener 
            // (or the component unmounting due to navigation) handle resolving the loading state
            // to prevent the immediate "bounce back to login page" jitter.
            console.log('[AuthContext] login finally block');
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, isAuthenticated: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
