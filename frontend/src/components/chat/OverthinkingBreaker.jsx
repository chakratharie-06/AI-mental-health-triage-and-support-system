import React, { useState, useEffect } from 'react';
import { Brain, HeartPulse, RefreshCcw, Wind } from 'lucide-react';

export default function OverthinkingBreaker({ onInvokeChat }) {
    const [step, setStep] = useState('idle'); // idle, breath, reframe
    const [breathPhase, setBreathPhase] = useState('');

    useEffect(() => {
        if (step !== 'breath') return;
        
        // 4-7-8 breathing logic mock (simplified to 4-4-4 for quick interactive feel)
        let cycle = 0;
        const phases = ['Inhale...', 'Hold...', 'Exhale...'];
        
        setBreathPhase(phases[0]);
        const interval = setInterval(() => {
            cycle = (cycle + 1) % 3;
            setBreathPhase(phases[cycle]);
            
            // Auto stop after 3 full cycles (9 steps)
            if (cycle === 0 && Math.random() < 0.2) { // Just stop eventually for the demo
                setStep('reframe');
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [step]);

    const handleStart = () => {
        setStep('breath');
    };

    const handleReframe = (prompt) => {
        setStep('idle');
        onInvokeChat(prompt, "The user clicked a cognitive reframing prompt from the Overthinking Breaker. Help them deconstruct their catastrophic thought using CBT techniques.");
    };

    return (
        <div style={{
            background: "linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)",
            border: "1.5px solid #c7d2fe",
            borderRadius: 18, padding: "16px",
            boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
            fontFamily: "system-ui,sans-serif",
            animation: "cn-pop 0.3s ease",
            position: "relative", overflow: "hidden"
        }}>
            <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.1 }}>
                <Brain size={80} />
            </div>

            <p style={{ fontSize: 11, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                <HeartPulse size={14} /> Overthinking Breaker
            </p>

            {step === 'idle' && (
                <div>
                    <p style={{ fontSize: 12, color: "#4338ca", margin: "0 0 12px", lineHeight: 1.4, fontWeight: 500 }}>
                        Stuck in a loop? Let's reset your thoughts.
                    </p>
                    <button 
                        onClick={handleStart}
                        style={{
                            width: "100%", padding: "10px", background: "#4f46e5", color: "white",
                            border: "none", borderRadius: 12, fontWeight: 600, fontSize: 12,
                            cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 6,
                            boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)"
                        }}>
                        <Wind size={14} /> Start 60s Reset
                    </button>
                </div>
            )}

            {step === 'breath' && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{
                        width: 60, height: 60, margin: "0 auto 12px",
                        background: breathPhase === 'Inhale...' ? "#818cf8" : breathPhase === 'Hold...' ? "#6366f1" : "#a5b4fc",
                        borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center",
                        color: "white", transition: "all 2s ease-in-out",
                        transform: breathPhase === 'Inhale...' ? "scale(1.2)" : breathPhase === 'Exhale...' ? "scale(0.8)" : "scale(1.1)"
                    }}>
                        <Wind size={24} />
                    </div>
                    <p style={{ fontWeight: 700, color: "#4338ca", fontSize: 14 }}>{breathPhase}</p>
                    <button onClick={() => setStep('reframe')} style={{ marginTop: 10, background: "none", border: "1px solid #818cf8", borderRadius: 6, padding: "4px 8px", color: "#4f46e5", fontSize: 10, cursor: "pointer" }}>
                        Skip to Reframing
                    </button>
                </div>
            )}

            {step === 'reframe' && (
                <div>
                    <p style={{ fontSize: 12, color: "#4338ca", margin: "0 0 10px", fontWeight: 600 }}>
                        Pick a path to talk about it:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button 
                            onClick={() => handleReframe("I'm imagining the worst case scenario right now. Help me find perspective.")}
                            style={{ textAlign: "left", padding: "8px", background: "white", border: "1px solid #c7d2fe", borderRadius: 8, fontSize: 11, color: "#4f46e5", cursor: "pointer" }}>
                            "What's the worst that could happen?"
                        </button>
                        <button 
                            onClick={() => handleReframe("I feel like I'm failing at everything. Can you help me challenge this thought?")}
                            style={{ textAlign: "left", padding: "8px", background: "white", border: "1px solid #c7d2fe", borderRadius: 8, fontSize: 11, color: "#4f46e5", cursor: "pointer" }}>
                            "I feel like I'm failing."
                        </button>
                        <button 
                            onClick={() => setStep('idle')}
                            style={{ background: "transparent", border: "none", color: "#6366f1", fontSize: 11, cursor: "pointer", marginTop: 4, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
                            <RefreshCcw size={10} /> Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
