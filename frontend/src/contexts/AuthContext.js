import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode as jwt_decode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwt_decode(token);
                setUser(decoded);
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('token'); // Remove invalid token
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        try {
            localStorage.setItem('token', token);
            const decoded = jwt_decode(token);
            setUser(decoded);
        } catch (error) {
            console.error('Invalid token during login:', error);
            logout(); // Clear any invalid token
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);