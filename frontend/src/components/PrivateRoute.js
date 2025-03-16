import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children, roles = [] }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles.length && !roles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
}

export default PrivateRoute;