import { useState } from 'react';

const DRIFT_ITEMS = ['🌸', '🍃', '🦆', '🐢', '🌾', '🐸'];

export default function LotusPond() {
    const [items, setItems] = useState([]);

    const addItem = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const emoji = DRIFT_ITEMS[Math.floor(Math.random() * DRIFT_ITEMS.length)];

        setItems(prev => [...prev, { id: Date.now() + Math.random(), x, y, emoji, rot: Math.random() * 360 }]);
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, width: '100%' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, background: 'linear-gradient(135deg,#34d399,#059669)',
                    boxShadow: '0 4px 14px rgba(52,211,153,.3)'
                }}>🪷</div>
                <div>
                    <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem', color: '#1a1c2e', marginBottom: 2 }}>Peaceful Pond</h2>
                    <p style={{ fontSize: '.82rem', color: '#5a5f7a', fontWeight: 300 }}>Tap to gently place lotus flowers, leaves, and pond life.</p>
                </div>
            </div>

            <div 
                onClick={addItem}
                style={{ 
                    width: '100%', height: 350, background: 'radial-gradient(circle at 50% 50%, #bae6fd, #7dd3fc)', 
                    borderRadius: 24, position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    boxShadow: 'inset 0 0 20px rgba(14,165,233,0.2)'
                }}
            >
                {items.map(item => (
                    <div key={item.id} style={{
                        position: 'absolute', left: item.x, top: item.y, fontSize: '2rem', userSelect: 'none',
                        animation: `floatItem${Math.floor(Math.random()*3)} 12s infinite alternate ease-in-out, popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`
                    }}>
                        <div style={{ transform: `translate(-50%, -50%) rotate(${item.rot}deg)` }}>
                            {item.emoji}
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(2,132,199,0.6)', fontSize: '0.9rem', pointerEvents: 'none' }}>
                        Tap the water to add life
                    </div>
                )}
            </div>
            <style>{`
                @keyframes floatItem0 { 0% { margin-left: 0; margin-top: 0; } 100% { margin-left: -20px; margin-top: 15px; } }
                @keyframes floatItem1 { 0% { margin-left: 0; margin-top: 0; } 100% { margin-left: 15px; margin-top: 20px; } }
                @keyframes floatItem2 { 0% { margin-left: 0; margin-top: 0; } 100% { margin-left: 20px; margin-top: -10px; } }
                @keyframes popIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }
            `}</style>
        </div>
    );
}
