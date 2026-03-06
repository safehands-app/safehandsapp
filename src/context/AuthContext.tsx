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
    tenant_id: string | null;
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
        tenant_id: profile.tenant_id,
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
                setSession(session);
                if (session?.user) {
                    try {
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
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Failed to load profile:', error);
            throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
        }
        if (!data) {
            throw new Error('Your account profile does not exist in the database. Please contact support.');
        }

        if (data.is_active === false) {
            throw new Error('Your account has been suspended. Please contact your administrator.');
        }

        setUser(profileToUser(data as Profile));
    }

    const login = async (email: string, password: string) => {
        console.log('[AuthContext] login called');
        setLoading(true);
        try {
            console.log('[AuthContext] calling signInWithPassword...');
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            console.log('[AuthContext] signInWithPassword returned', { data, error });
            if (error) {
                setLoading(false); // ← release on auth error (wrong password etc.)
                throw new Error(error.message);
            }
            // onAuthStateChange will set loading=false after profile loads.
            // Safety net: if it never fires within 5s, release loading anyway.
            setTimeout(() => setLoading(false), 5000);
        } catch (err) {
            console.error('[AuthContext] login caught error:', err);
            setLoading(false); // ← release on any unexpected error
            throw err;
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
