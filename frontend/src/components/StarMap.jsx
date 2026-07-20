import { useState } from 'react';

export default function StarMap() {
    const [stars, setStars] = useState([]);

    const handleSkyClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setStars(prev => [...prev, {
            id: Date.now() + Math.random(),
            x, y,
            size: Math.random() * 4 + 2,
        }]);
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, width: '100%' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, background: 'linear-gradient(135deg,#3b82f6,#1e3a8a)',
                    boxShadow: '0 4px 14px rgba(59,130,246,.3)'
                }}>✨</div>
                <div>
                    <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem', color: '#1a1c2e', marginBottom: 2 }}>Night Sky</h2>
                    <p style={{ fontSize: '.82rem', color: '#5a5f7a', fontWeight: 300 }}>Tap on the dark sky to place gently twinkling stars.</p>
                </div>
            </div>

            <div 
                onClick={handleSkyClick}
                style={{ 
                    width: '100%', height: 350, background: 'linear-gradient(180deg, #0f172a, #1e293b)', 
                    borderRadius: 24, position: 'relative', overflow: 'hidden', cursor: 'crosshair',
                    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.2)'
                }}
            >
                {stars.map(s => (
                    <div key={s.id} style={{
                        position: 'absolute', left: s.x, top: s.y, width: s.size, height: s.size,
                        background: '#e2e8f0', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 12px 2px rgba(255,255,255,0.7)',
                        animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite alternate`
                    }}/>
                ))}
                {stars.length === 0 && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', pointerEvents: 'none' }}>
                        Tap to create stars
                    </div>
                )}
            </div>
            <style>{`@keyframes twinkle { 0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); } }`}</style>
        </div>
    );
}
