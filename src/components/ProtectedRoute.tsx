import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading your secure workspace...</div>;
    }

    if (!isAuthenticated || !user) {
        // Not logged in, redirect to login page
        return <Navigate to="/auth/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but doesn't have required role, redirect to appropriate dashboard
        switch (user.role) {
            case 'super-admin': return <Navigate to="/super-admin" replace />;
            case 'tenant-admin': return <Navigate to="/tenant-admin" replace />;
            case 'family': return <Navigate to="/family" replace />;
            default: return <Navigate to="/auth/login" replace />;
        }
    }

    // Authenticated and authorized
    return <Outlet />;
}
