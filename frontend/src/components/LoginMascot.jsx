
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const LoginMascot = ({ focusedField, textLength = 0 }) => {
    const controls = useAnimation();
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

    // Calculate eye position based on text length (email tracking)
    useEffect(() => {
        if (focusedField === 'email') {
            const x = Math.min(Math.max((textLength - 10) * 0.5, -5), 5); // Limit movement
            setEyePosition({ x, y: 2 });
        } else if (focusedField === 'none') {
            setEyePosition({ x: 0, y: 0 });
        }
    }, [focusedField, textLength]);

    // Hand Animation Variants
    const leftHandVariants = {
        idle: { y: 130, x: -50, rotate: 0 },
        password: { y: 20, x: 0, rotate: -20, transition: { type: 'spring', stiffness: 120 } },
        email: { y: 130, x: -50, rotate: 0 }
    };

    const rightHandVariants = {
        idle: { y: 130, x: 170, rotate: 0 },
        password: { y: 20, x: 120, rotate: 20, transition: { type: 'spring', stiffness: 120 } },
        email: { y: 130, x: 170, rotate: 0 }
    };

    return (
        <div className="w-28 h-28 mx-auto relative overflow-hidden -mb-6 z-10">
            <svg viewBox="0 0 120 120" className="w-full h-full">
                {/* Ears */}
                <circle cx="25" cy="30" r="15" fill="#a0522d" />
                <circle cx="25" cy="30" r="8" fill="#deb887" />
                <circle cx="95" cy="30" r="15" fill="#a0522d" />
                <circle cx="95" cy="30" r="8" fill="#deb887" />

                {/* Head */}
                <circle cx="60" cy="65" r="45" fill="#a0522d" />

                {/* Muzzle (Snout) */}
                <ellipse cx="60" cy="75" rx="20" ry="14" fill="#deb887" />
                <circle cx="60" cy="70" r="5" fill="#3e2723" />

                {/* Mouth */}
                {!focusedField === 'password' && (
                    <path d="M 55 82 Q 60 86 65 82" stroke="#3e2723" strokeWidth="2" fill="none" />
                )}

                {/* Eyes Container */}
                <g className="eyes">
                    {/* Left Eye Whites */}
                    <circle cx="45" cy="55" r="8" fill="white" />
                    {/* Right Eye Whites */}
                    <circle cx="75" cy="55" r="8" fill="white" />

                    {/* Pupils - Moving */}
                    <motion.circle
                        animate={{ cx: 45 + eyePosition.x, cy: 55 + eyePosition.y }}
                        r="3.5" fill="black"
                    />
                    <motion.circle
                        animate={{ cx: 75 + eyePosition.x, cy: 55 + eyePosition.y }}
                        r="3.5" fill="black"
                    />
                </g>

                {/* Hands */}
                {/* Left Hand */}
                <motion.path
                    d="M 10 110 C 10 110, 40 70, 50 60 C 50 60, 40 50, 20 80 Z"
                    fill="#a0522d"
                    stroke="#5d4037"
                    strokeWidth="2"
                    initial="idle"
                    animate={focusedField === 'password' ? 'password' : 'idle'}
                    variants={leftHandVariants}
                    style={{ originX: 0.1, originY: 1 }} // Pivot from bottom left
                />

                {/* Simple Circle Hands for cleaner look if path fails, but let's try circles positioned absolutely via framer */}
            </svg>

            {/* Overlay Hands (CSS/Divs for easier absolute positioning on top of eyes) */}
            <motion.div
                className="absolute w-12 h-12 bg-[#a0522d] rounded-full border-2 border-[#5d4037]"
                initial={{ bottom: -50, left: 10 }}
                animate={focusedField === 'password' ? { bottom: 60, left: 25 } : { bottom: -40, left: 10 }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            />
            <motion.div
                className="absolute w-12 h-12 bg-[#a0522d] rounded-full border-2 border-[#5d4037]"
                initial={{ bottom: -50, right: 10 }}
                animate={focusedField === 'password' ? { bottom: 60, right: 25 } : { bottom: -40, right: 10 }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            />
        </div>
    );
};

export default LoginMascot;
