import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

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
            authService.getMe()
                .then(data => {
                    setUser(data.user);
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
        const data = await authService.login(email, password);
        const { token, user } = data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        return user;
    };

    const signup = async (name, email, password, age) => {
        const data = await authService.signup(name, email, password, age);
        // Do not log the user in immediately; they must verify email first.
        // The API now returns a message and dev_verify_link instead of a token.
        return data;
    };

    const anonymousLogin = async () => {
        const data = await authService.anonymousLogin();
        const { token, user } = data;
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
