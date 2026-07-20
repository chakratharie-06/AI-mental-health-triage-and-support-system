import { useState, useEffect } from 'react';

export default function BubblePop() {
    const [bubbles, setBubbles] = useState([]);
    
    useEffect(() => {
        // create a grid of 35 bubbles
        const initialBubbles = Array.from({ length: 35 }).map((_, i) => ({
            id: i,
            popped: false,
            scale: Math.random() * 0.3 + 0.85 // slight size variation
        }));
        setBubbles(initialBubbles);
    }, []);

    function popBubble(index) {
        if (bubbles[index].popped) return;
        
        // simple pop sound effect using audio context
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (err) {
            // ignore audio errors
        }

        const newBubbles = [...bubbles];
        newBubbles[index].popped = true;
        setBubbles(newBubbles);

        // Respawn bubble after some time for endless popping relax
        setTimeout(() => {
            setBubbles(current => {
                const refreshed = [...current];
                if(refreshed[index]) {
                    refreshed[index] = { ...refreshed[index], popped: false, scale: Math.random() * 0.3 + 0.85 };
                }
                return refreshed;
            });
        }, 4000 + Math.random() * 3000);
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, width: '100%' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22,
                    background: 'linear-gradient(135deg,#5b9cf6,#3a75e8)',
                    boxShadow: '0 4px 14px rgba(91,156,246,.3)'
                }}>🫧</div>
                <div>
                    <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem', color: '#1a1c2e', marginBottom: 2 }}>
                        Endless Bubble Wrap
                    </h2>
                    <p style={{ fontSize: '.82rem', color: '#5a5f7a', fontWeight: 300 }}>
                        Pop bubbles to relieve stress. They gently refill after a few seconds.
                    </p>
                </div>
            </div>

            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center',
                background: 'rgba(255,255,255,0.4)', padding: 30, borderRadius: 24,
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(255, 255, 255, 0.6)'
            }}>
                {bubbles.map((b, i) => (
                    <div
                        key={b.id}
                        onClick={() => popBubble(i)}
                        style={{
                            width: 50, height: 50, borderRadius: '50%',
                            background: b.popped 
                                ? 'transparent' 
                                : 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(91,156,246,0.25))',
                            boxShadow: b.popped 
                                ? 'inset 0 0 10px rgba(0,0,0,0.05)' 
                                : `0 4px 12px rgba(91,156,246,0.2), inset 0 -4px 10px rgba(255,255,255,0.5)`,
                            transform: b.popped ? 'scale(0.8)' : `scale(${b.scale})`,
                            border: b.popped ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.8)',
                            opacity: b.popped ? 0.3 : 1,
                            transition: b.popped ? 'all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'all 0.7s ease',
                            cursor: b.popped ? 'default' : 'pointer'
                        }}
                    >
                    </div>
                ))}
            </div>
            <style>
                {`@media(max-width:640px) { div[style*="width: 50px"] { width: 40px !important; height: 40px !important; } }`}
            </style>
        </div>
    );
}
