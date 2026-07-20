import { useState } from 'react';

const COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#fbbf24'];

export default function ColorRipple() {
    const [ripples, setRipples] = useState([]);

    const dropRipple = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        const newRipple = { id: Date.now() + Math.random(), x, y, color };
        setRipples(prev => [...prev, newRipple]);

        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 3000);
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, width: '100%' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, background: 'linear-gradient(135deg,#c084fc,#818cf8)',
                    boxShadow: '0 4px 14px rgba(192,132,252,.3)'
                }}>💧</div>
                <div>
                    <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem', color: '#1a1c2e', marginBottom: 2 }}>Water Ripples</h2>
                    <p style={{ fontSize: '.82rem', color: '#5a5f7a', fontWeight: 300 }}>Tap anywhere to create soothing, fading color ripples.</p>
                </div>
            </div>

            <div 
                onClick={dropRipple}
                style={{ 
                    width: '100%', height: 350, background: '#f8fafc', 
                    borderRadius: 24, position: 'relative', overflow: 'hidden', cursor: 'crosshair',
                    border: '1px solid #e2e8f0', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.03)'
                }}
            >
                {ripples.map(r => (
                    <div key={r.id} style={{
                        position: 'absolute', left: r.x, top: r.y,
                        width: 10, height: 10, borderRadius: '50%',
                        background: 'transparent', transform: 'translate(-50%, -50%)',
                        border: `3px solid ${r.color}`,
                        animation: 'rippleAnim 3s cubic-bezier(0.1, 0.8, 0.3, 1) forwards'
                    }}/>
                ))}
                {ripples.length === 0 && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(50,50,70,0.4)', fontSize: '0.9rem', pointerEvents: 'none' }}>
                        Tap to create ripples
                    </div>
                )}
            </div>
            <style>{`
                @keyframes rippleAnim {
                    0% { width: 0px; height: 0px; opacity: 0.8; border-width: 6px; }
                    100% { width: 400px; height: 400px; opacity: 0; border-width: 0px; }
                }
            `}</style>
        </div>
    );
}
