import { useRef, useState, useEffect } from 'react';

export default function ZenRake() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fdf8e7'; // sand color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const getParams = (e) => {
        const docEl = document.documentElement;
        const rect = e.target.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const offsetX = clientX - rect.left - docEl.scrollLeft;
        const offsetY = clientY - rect.top - docEl.scrollTop;
        return { offsetX, offsetY };
    };

    const startDrawing = (e) => {
        const { offsetX, offsetY } = getParams(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getParams(e);
        const ctx = canvasRef.current.getContext('2d');
        // Rake pattern: draw multiple faint lines to look like raked sand
        ctx.lineTo(offsetX, offsetY);
        ctx.strokeStyle = 'rgba(214, 202, 172, 0.4)'; // darker sand line
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY); // reset for next drag
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const reset = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fdf8e7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, width: '100%' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, background: 'linear-gradient(135deg,#eab308,#ca8a04)',
                    boxShadow: '0 4px 14px rgba(234,179,8,.3)'
                }}>🏜️</div>
                <div>
                    <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem', color: '#1a1c2e', marginBottom: 2 }}>Zen Garden</h2>
                    <p style={{ fontSize: '.82rem', color: '#5a5f7a', fontWeight: 300 }}>Drag across the sand to trace mindful rake patterns.</p>
                </div>
            </div>

            <div style={{ padding: 20, background: 'rgba(255,255,255,0.7)', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', width: '100%' }}>
                <button onClick={reset} style={{ position: 'absolute', top: 32, right: 32, padding: '6px 12px', borderRadius: 20, border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '0.8rem', zIndex: 10 }}>Smooth Sand</button>
                <div style={{ position: 'relative', width: '100%', height: 350 }}>
                    <canvas 
                        ref={canvasRef}
                        width={800} 
                        height={350} 
                        style={{ width: '100%', height: '100%', borderRadius: 14, cursor: 'crosshair', background: '#fdf8e7', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)' }}
                        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    />
                </div>
            </div>
        </div>
    );
}
