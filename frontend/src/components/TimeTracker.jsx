import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

/**
 * TimeTracker - Invisible component that logs app usage.
 * Sends a ping to the backend every 60 seconds of active focus.
 */
function TimeTracker() {
    const { token } = useAuth();
    const isTabActive = useRef(true);

    useEffect(() => {
        const handleFocus = () => isTabActive.current = true;
        const handleBlur = () => isTabActive.current = false;

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        const interval = setInterval(() => {
            if (isTabActive.current && token) {
                // User spent 1 minute actively on the app
                axios.post('http://localhost:5000/api/time_log', 
                    { minutes: 1 }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                ).catch(err => console.error('Failed to log time:', err));
            }
        }, 60000); // 1 minute interval

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            clearInterval(interval);
        };
    }, [token]);

    return null; // completely invisible component
}

export default TimeTracker;
