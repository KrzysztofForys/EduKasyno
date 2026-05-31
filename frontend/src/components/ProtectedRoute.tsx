import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    isAuthenticated: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated }) => {
    // Jeśli użytkownik NIE jest zalogowany, przekieruj go na /login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Jeśli jest zalogowany, renderuj komponenty wewnętrzne (dzieci)
    return <Outlet />;
};