import { createContext, useContext, useState, useEffect, useRef } from 'react';
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

    // Track if an explicit login is happening to prevent onAuthStateChange double-fires
    const isExplicitLogin = useRef(false);

    // On mount — restore session from Supabase
    useEffect(() => {
        let mounted = true;

        async function initAuth() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!mounted) return;
                
                setSession(session);
                if (session?.user) {
                    await loadProfile(session.user.id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to init auth on mount:", err);
                if (mounted) setLoading(false);
            }
        }

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;
                setSession(session);
                
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setLoading(false);
                } else if (session?.user) {
                    // Prevent this listener from racing the explicit login() function
                    if (isExplicitLogin.current) {
                        return; // Let login() handle profile loading to prevent lock contention
                    }
                    
                    // Only reload top-level profile if not already loaded
                    if (!user || user.id !== session.user.id) {
                        try {
                            await loadProfile(session.user.id);
                        } catch (err) {
                            console.error("Background profile sync failed:", err);
                        }
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    async function loadProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw new Error(`Database error: ${error.message}`);
            if (!data) throw new Error('Your account profile does not exist in the database.');
            if (data.is_active === false) throw new Error('Your account has been suspended. Please contact your administrator.');

            setUser(profileToUser(data as Profile));
        } catch (err) {
            setUser(null);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const login = async (email: string, password: string) => {
        setLoading(true);
        isExplicitLogin.current = true;
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw new Error(error.message);
            
            if (data.user) {
                // Explicitly load the profile here and await it so the UI knows exactly when it's done
                await loadProfile(data.user.id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
            throw err;
        } finally {
            isExplicitLogin.current = false;
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
        } finally {
            setUser(null);
            setSession(null);
            setLoading(false);
        }
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
