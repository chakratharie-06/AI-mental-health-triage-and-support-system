import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Verify token and get user data
            axios.get('/api/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setUser(response.data.user);
                    setLoading(false);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const response = await axios.post('/api/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        return user;
    };

    const signup = async (name, email, password, age) => {
        const response = await axios.post('/api/signup', { name, email, password, age });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        return user;
    };

    const anonymousLogin = async () => {
        const response = await axios.post('/api/anonymous-login');
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (data) => {
        setUser(prev => ({ ...prev, ...data }));
    };

    const value = {
        user,
        token,
        login,
        register: signup, // Alias for SignUp page compatibility
        signup,
        anonymousLogin,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
