import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Role = 'family' | 'super-admin' | 'tenant-admin' | 'field-executive' | 'vendor' | null;

interface User {
    id: string;
    email: string;
    role: Role;
    name: string;
    initials?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Mock login function that determines role based on email input
    const login = (email: string) => {
        if (!email) throw new Error("Email is required");

        const lowerEmail = email.toLowerCase();
        let matchedUser: User | null = null;

        // Simulate database lookup resolving to a specific role based on the email domain or specific user
        if (lowerEmail.includes("family")) {
            // Associated with familyData.json -> Sarah Jenkins
            matchedUser = { id: 'u1', email: lowerEmail, role: 'family', name: 'Sarah Jenkins' };
        } else if (lowerEmail.includes("admin@safehands")) {
            // Associated with superAdminData.json -> Platform Admin
            matchedUser = { id: 'u2', email: lowerEmail, role: 'super-admin', name: 'Platform Admin' };
        } else if (lowerEmail.includes("oakridge")) {
            // Associated with tenantAdminData.json -> Oakridge Care Group Admin
            matchedUser = { id: 'u3', email: lowerEmail, role: 'tenant-admin', name: 'Oakridge Admin' };
        } else if (lowerEmail.includes("field")) {
            // Associated with fieldExecData.json -> Marcus Kane
            matchedUser = { id: 'u4', email: lowerEmail, role: 'field-executive', name: 'Marcus Kane' };
        } else if (lowerEmail.includes("vendor")) {
            // Associated with vendorData.json -> Acme Medical Supplies
            matchedUser = { id: 'v101', email: lowerEmail, role: 'vendor', name: 'Acme Medical Supplies' };
        } else {
            // Fallback default super admin
            matchedUser = { id: 'u99', email: lowerEmail, role: 'super-admin', name: 'Guest Admin' };
        }

        if (matchedUser) {
            // Generate initials from name (e.g. "Sarah Jenkins" -> "SJ")
            const nameParts = matchedUser.name.split(' ');
            matchedUser.initials = nameParts.length > 1
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                : matchedUser.name.slice(0, 2).toUpperCase();
        }

        setUser(matchedUser);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
