import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import MemoryGame from '../components/MemoryGame';
import BubblePop from '../components/BubblePop';
import ZenRake from '../components/ZenRake';
import StarMap from '../components/StarMap';
import ColorRipple from '../components/ColorRipple';
import LotusPond from '../components/LotusPond';

/* ─── Audio helpers ─────────────────────────────────────────── */
let _AC = null;
function getAC() {
    if (!_AC) _AC = new (window.AudioContext || window.webkitAudioContext)();
    if (_AC.state === 'suspended') _AC.resume();
    return _AC;
}

function mkWhite(secs) {
    const a = getAC(), len = a.sampleRate * secs;
    const b = a.createBuffer(1, len, a.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
}

function mkPink(secs) {
    const a = getAC(), len = a.sampleRate * secs;
    const b = a.createBuffer(1, len, a.sampleRate);
    const d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759;
        b2 = .96900 * b2 + w * .1538520; b3 = .86650 * b3 + w * .3104856;
        b4 = .55000 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * 0.11; b6 = w * .115926;
    }
    return b;
}

const MULT = { ocean: .35, rain: .45, forest: .35, medi: .18 };

function buildOcean(vol) {
    const a = getAC();
    const src = a.createBufferSource(); src.buffer = mkWhite(8); src.loop = true;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.Q.value = 1.2;
    const lfo = a.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.09;
    const lfoG = a.createGain(); lfoG.gain.value = 340; lfo.connect(lfoG); lfoG.connect(lp.frequency);
    const vLfo = a.createOscillator(); vLfo.frequency.value = 0.07;
    const vLfoG = a.createGain(); vLfoG.gain.value = .28; vLfo.connect(vLfoG);
    const mg = a.createGain(); mg.gain.value = vol * MULT.ocean; vLfoG.connect(mg.gain);
    src.connect(lp); lp.connect(mg); mg.connect(a.destination);
    src.start(); lfo.start(); vLfo.start();
    return { gain: mg, stop() { mg.gain.setTargetAtTime(0, a.currentTime, .4); setTimeout(() => [src, lfo, vLfo].forEach(n => { try { n.stop() } catch (e) { } }), 1500); } };
}

function buildRain(vol) {
    const a = getAC();
    const mg = a.createGain(); mg.gain.value = vol * MULT.rain; mg.connect(a.destination);
    const srcs = [];
    [{ f: 600, q: 1.5, g: .55 }, { f: 1800, q: 1.2, g: .40 }, { f: 4000, q: .9, g: .28 }, { f: 8500, q: .7, g: .14 }]
        .forEach(l => {
            const s = a.createBufferSource(); s.buffer = mkWhite(4); s.loop = true;
            const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = l.f; bp.Q.value = l.q;
            const g = a.createGain(); g.gain.value = l.g;
            s.connect(bp); bp.connect(g); g.connect(mg); s.start(); srcs.push(s);
        });
    let dT;
    (function drip() {
        const a2 = getAC(), o = a2.createOscillator(); o.type = 'sine'; o.frequency.value = 900 + Math.random() * 1200;
        const e = a2.createGain();
        e.gain.setValueAtTime(0, a2.currentTime);
        e.gain.linearRampToValueAtTime(vol * .05, a2.currentTime + .01);
        e.gain.exponentialRampToValueAtTime(.0001, a2.currentTime + .28);
        o.connect(e); e.connect(a2.destination); o.start(); o.stop(a2.currentTime + .32);
        dT = setTimeout(drip, 300 + Math.random() * 1400);
    })();
    return { gain: mg, stop() { clearTimeout(dT); mg.gain.setTargetAtTime(0, a.currentTime, .4); setTimeout(() => srcs.forEach(s => { try { s.stop() } catch (e) { } }), 1500); } };
}

function buildForest(vol) {
    const a = getAC();
    const src = a.createBufferSource(); src.buffer = mkPink(8); src.loop = true;
    const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 280;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    const lfo = a.createOscillator(); lfo.frequency.value = .08;
    const lfoG = a.createGain(); lfoG.gain.value = .25; lfo.connect(lfoG);
    const mg = a.createGain(); mg.gain.value = vol * MULT.forest; lfoG.connect(mg.gain);
    src.connect(hp); hp.connect(lp); lp.connect(mg); mg.connect(a.destination);
    src.start(); lfo.start();
    let bT;
    (function chirp() {
        const a2 = getAC(), f = 2100 + Math.random() * 1600;
        for (let i = 0; i < 3; i++) {
            const o = a2.createOscillator(); o.type = 'sine'; o.frequency.value = f + i * 130;
            const e = a2.createGain(), t0 = a2.currentTime + i * .13;
            e.gain.setValueAtTime(0, t0); e.gain.linearRampToValueAtTime(vol * .07, t0 + .04);
            e.gain.exponentialRampToValueAtTime(.0001, t0 + .2);
            o.connect(e); e.connect(a2.destination); o.start(t0); o.stop(t0 + .25);
        }
        bT = setTimeout(chirp, 3500 + Math.random() * 7000);
    })();
    return { gain: mg, stop() { clearTimeout(bT); mg.gain.setTargetAtTime(0, a.currentTime, .4); setTimeout(() => [src, lfo].forEach(n => { try { n.stop() } catch (e) { } }), 1500); } };
}

function buildMedi(vol) {
    const a = getAC();
    const mg = a.createGain(); mg.gain.value = vol * MULT.medi;
    const dly = a.createDelay(3); dly.delayTime.value = 1.9;
    const fb = a.createGain(); fb.gain.value = .48;
    const wet = a.createGain(); wet.gain.value = .55;
    dly.connect(fb); fb.connect(dly); dly.connect(wet);
    mg.connect(dly); mg.connect(a.destination); wet.connect(a.destination);
    const oscs = [];
    [130.81, 196, 261.63, 329.63, 392].forEach((f, i) => {
        const o = a.createOscillator(); o.type = i < 2 ? 'sine' : 'triangle';
        o.frequency.value = f; o.detune.value = (Math.random() - .5) * 7;
        const g = a.createGain(); g.gain.setValueAtTime(0, a.currentTime);
        g.gain.linearRampToValueAtTime(.25 - i * .033, a.currentTime + 1.5 + i * .7);
        o.connect(g); g.connect(mg); o.start(); oscs.push(o);
    });
    const ns = a.createBufferSource(); ns.buffer = mkPink(6); ns.loop = true;
    const nlp = a.createBiquadFilter(); nlp.type = 'lowpass'; nlp.frequency.value = 160;
    const ng = a.createGain(); ng.gain.value = .09;
    ns.connect(nlp); nlp.connect(ng); ng.connect(mg); ns.start();
    let bellT;
    (function bell() {
        const a2 = getAC(), o = a2.createOscillator(); o.type = 'sine'; o.frequency.value = 432;
        const e = a2.createGain();
        e.gain.setValueAtTime(0, a2.currentTime); e.gain.linearRampToValueAtTime(vol * .2, a2.currentTime + .03);
        e.gain.exponentialRampToValueAtTime(.0001, a2.currentTime + 5.5);
        o.connect(e); e.connect(dly); e.connect(a2.destination); o.start(); o.stop(a2.currentTime + 6);
        bellT = setTimeout(bell, 9000);
    })();
    return { gain: mg, stop() { clearTimeout(bellT); mg.gain.setTargetAtTime(0, a.currentTime, .5); setTimeout(() => { oscs.forEach(o => { try { o.stop() } catch (e) { } }); try { ns.stop() } catch (e) { } }, 2000); } };
}

const BUILDERS = { ocean: buildOcean, rain: buildRain, forest: buildForest, medi: buildMedi };
const NAMES = { ocean: '🌊 Ocean Waves', rain: '🌧️ Rainfall', forest: '🍃 Forest Breeze', medi: '🎵 Meditation Music' };

/* ─── Card config ────────────────────────────────────────────── */
const CARDS = [
    { id: 'ocean', emoji: '🌊', title: 'Ocean Waves', desc: 'Gentle waves lapping on the shore', bg: '#e8eeff', iconGrad: 'linear-gradient(135deg,#5b9cf6,#3a75e8)', btnClass: 'btn-ocean' },
    { id: 'rain', emoji: '🌧️', title: 'Rainfall', desc: 'Soft rain on a quiet afternoon', bg: '#eef0f8', iconGrad: 'linear-gradient(135deg,#7a8fb8,#506090)', btnClass: 'btn-rain' },
    { id: 'forest', emoji: '🍃', title: 'Forest Breeze', desc: 'Wind through the trees', bg: '#e8f5ef', iconGrad: 'linear-gradient(135deg,#4cd48a,#28a05a)', btnClass: 'btn-forest' },
    { id: 'medi', emoji: '🎵', title: 'Meditation Music', desc: 'Calming instrumental tones', bg: '#f5eeff', iconGrad: 'linear-gradient(135deg,#e060f0,#a030c0)', btnClass: 'btn-medi' },
];

/* ─── Waveform indicator ─────────────────────────────────────── */
function Waveform() {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, height: 16, verticalAlign: 'middle' }}>
            {[0, .15, .3, .45, .6].map((d, i) => (
                <span key={i} style={{
                    width: 3, borderRadius: 2, background: 'rgba(255,255,255,.9)',
                    animation: `rwave 0.8s ease-in-out ${d}s infinite`,
                    height: [5, 11, 16, 9, 6][i],
                }} />
            ))}
        </span>
    );
}

/* ─── 5-Step Breathing Exercise ──────────────────────────────── */
const BREATH_STEPS = [
    { label: 'Get Ready', instruction: 'Sit comfortably, close your eyes and relax your shoulders.', duration: 3, color: '#7a6cf8', scale: 0.6 },
    { label: 'Inhale', instruction: 'Breathe in slowly and deeply through your nose.', duration: 4, color: '#5b9cf6', scale: 1.0 },
    { label: 'Hold', instruction: 'Gently hold your breath. Stay still and calm.', duration: 4, color: '#4cd48a', scale: 1.0 },
    { label: 'Exhale', instruction: 'Breathe out slowly and fully through your mouth.', duration: 6, color: '#f08060', scale: 0.5 },
    { label: 'Rest', instruction: 'Rest naturally. Notice how calm you feel.', duration: 2, color: '#a78bfa', scale: 0.6 },
];

function BreathingExercise() {
    const [active, setActive] = useState(false);
    const [stepIdx, setStepIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(BREATH_STEPS[0].duration);
    const [cycle, setCycle] = useState(1);
    const timerRef = useRef(null);

    function reset() {
        clearInterval(timerRef.current);
        setStepIdx(0);
        setTimeLeft(BREATH_STEPS[0].duration);
        setCycle(1);
        setActive(false);
    }

    function startStop() {
        if (active) { reset(); return; }
        setActive(true);
        setStepIdx(0);
        setTimeLeft(BREATH_STEPS[0].duration);
    }

    useEffect(() => {
        if (!active) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev > 1) return prev - 1;
                // advance step
                setStepIdx(si => {
                    const next = si + 1;
                    if (next >= BREATH_STEPS.length) {
                        setCycle(c => c + 1);
                        setTimeLeft(BREATH_STEPS[0].duration);
                        return 0;
                    }
                    setTimeLeft(BREATH_STEPS[next].duration);
                    return next;
                });
                return 0; // replaced by setTimeLeft inside setStepIdx
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [active]);

    const step = BREATH_STEPS[stepIdx];

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto 0', padding: '0 40px 36px' }}>
            <div style={{
                borderRadius: 22, padding: '32px 36px',
                background: 'rgba(255,255,255,0.72)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 24px rgba(0,0,0,.07)',
                backdropFilter: 'blur(12px)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 22,
                        background: 'linear-gradient(135deg,#7a6cf8,#5b9cf6)',
                        boxShadow: '0 4px 14px rgba(122,108,248,.3)'
                    }}>🫁</div>
                    <div>
                        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem', color: '#1a1c2e', marginBottom: 2 }}>
                            Breathing Exercise
                        </h2>
                        <p style={{ fontSize: '.82rem', color: '#5a5f7a', fontWeight: 300 }}>
                            5-step guided box breathing · Cycle {cycle}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 36, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Animated circle */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 140, height: 140, borderRadius: '50%',
                            background: `radial-gradient(circle, ${step.color}33 0%, ${step.color}11 70%)`,
                            border: `3px solid ${step.color}55`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 1s ease-in-out',
                            boxShadow: active ? `0 0 40px ${step.color}44` : 'none',
                        }}>
                            <div style={{
                                width: active ? `${step.scale * 100}px` : '60px',
                                height: active ? `${step.scale * 100}px` : '60px',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${step.color}cc, ${step.color}88)`,
                                transition: `all ${step.duration * 0.9}s ease-in-out`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 4px 20px ${step.color}66`,
                            }}>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: active ? '1.1rem' : '.9rem' }}>
                                    {active ? timeLeft : '●'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={startStop}
                            style={{
                                padding: '10px 28px', borderRadius: 50, border: 'none', cursor: 'pointer',
                                fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '.88rem',
                                background: active
                                    ? 'linear-gradient(135deg,#f08060,#e04040)'
                                    : 'linear-gradient(135deg,#7a6cf8,#5b9cf6)',
                                color: '#fff', boxShadow: active
                                    ? '0 4px 16px rgba(240,100,80,.4)'
                                    : '0 4px 16px rgba(122,108,248,.4)',
                                transition: 'all .2s',
                            }}
                        >
                            {active ? '⏹ Stop' : '▶ Start'}
                        </button>
                    </div>

                    {/* Steps list */}
                    <div style={{ flex: 1, minWidth: 220 }}>
                        {BREATH_STEPS.map((s, i) => {
                            const isCurrent = active && i === stepIdx;
                            const isDone = active && i < stepIdx;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 14,
                                    padding: '10px 14px', borderRadius: 14, marginBottom: 6,
                                    background: isCurrent ? `${s.color}18` : 'transparent',
                                    border: isCurrent ? `1.5px solid ${s.color}44` : '1.5px solid transparent',
                                    transition: 'all .3s',
                                }}>
                                    {/* Step number / check */}
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '.78rem', fontWeight: 700,
                                        background: isCurrent ? s.color : isDone ? '#4cd48a' : 'rgba(0,0,0,.08)',
                                        color: isCurrent || isDone ? '#fff' : '#5a5f7a',
                                        transition: 'all .3s',
                                    }}>
                                        {isDone ? '✓' : i + 1}
                                    </div>
                                    <div>
                                        <div style={{
                                            fontWeight: isCurrent ? 600 : 400,
                                            color: isCurrent ? '#1a1c2e' : '#5a5f7a',
                                            fontSize: '.9rem', marginBottom: 2,
                                        }}>
                                            {s.label}
                                            <span style={{
                                                marginLeft: 8, fontSize: '.75rem', fontWeight: 300,
                                                color: isCurrent ? s.color : '#aaa',
                                            }}>{s.duration}s</span>
                                        </div>
                                        <div style={{ fontSize: '.78rem', color: '#8a8faa', fontWeight: 300, lineHeight: 1.4 }}>
                                            {s.instruction}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main component ─────────────────────────────────────────── */
const GAMES_LIST = [
    { id: 'memory', title: 'Memory Match', desc: 'Gentle matching puzzle', icon: '🧩', bg: 'linear-gradient(135deg,#f08060,#e04040)', shadow: 'rgba(240,128,96,.3)' },
    { id: 'bubble', title: 'Bubble Wrap', desc: 'Endless virtual popping', icon: '🫧', bg: 'linear-gradient(135deg,#5b9cf6,#3a75e8)', shadow: 'rgba(91,156,246,.3)' },
    { id: 'zenrake', title: 'Zen Garden', desc: 'Draw mindful patterns', icon: '🏜️', bg: 'linear-gradient(135deg,#eab308,#ca8a04)', shadow: 'rgba(234,179,8,.3)' },
    { id: 'starmap', title: 'Night Sky', desc: 'Place gentle stars', icon: '✨', bg: 'linear-gradient(135deg,#3b82f6,#1e3a8a)', shadow: 'rgba(59,130,246,.3)' },
    { id: 'ripple', title: 'Water Ripples', desc: 'Create soothing ripples', icon: '💧', bg: 'linear-gradient(135deg,#c084fc,#818cf8)', shadow: 'rgba(192,132,252,.3)' },
    { id: 'lotus', title: 'Peaceful Pond', desc: 'Add lotus flowers to water', icon: '🪷', bg: 'linear-gradient(135deg,#34d399,#059669)', shadow: 'rgba(52,211,153,.3)' },
];

export default function RelaxPage() {
    const [playingIds, setPlayingIds] = useState({});   // id → true/false
    const [vols, setVols] = useState({ ocean: .7, rain: .7, forest: .7, medi: .7 });
    const [toast, setToast] = useState({ msg: '', show: false });
    const [activeGame, setActiveGame] = useState(null);
    const playingRef = useRef({});   // stores live audio handle objects
    const toastTRef = useRef(null);

    /* stop all sounds on unmount */
    useEffect(() => {
        return () => {
            Object.values(playingRef.current).forEach(h => { try { h.stop(); } catch (e) { } });
        };
    }, []);

    function showToast(msg) {
        setToast({ msg, show: true });
        clearTimeout(toastTRef.current);
        toastTRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
    }

    function toggle(id) {
        if (playingRef.current[id]) {
            playingRef.current[id].stop();
            delete playingRef.current[id];
            setPlayingIds(p => ({ ...p, [id]: false }));
            showToast('⏹ Stopped');
        } else {
            try {
                Object.keys(playingRef.current).forEach(key => {
                    playingRef.current[key].stop();
                    delete playingRef.current[key];
                });
                const handle = BUILDERS[id](vols[id]);
                playingRef.current[id] = handle;
                setPlayingIds({ [id]: true });
                showToast('Now playing ' + NAMES[id]);
            } catch (err) {
                showToast('⚠️ Audio blocked – please allow audio in your browser');
                console.error(err);
            }
        }
    }

    function setVol(id, v) {
        setVols(prev => ({ ...prev, [id]: v }));
        if (playingRef.current[id]?.gain) {
            const a = getAC();
            playingRef.current[id].gain.gain.setTargetAtTime(v * MULT[id], a.currentTime, .05);
        }
    }

    return (
        <>
            {/* keyframe injected once */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        @keyframes rwave { 0%,100%{transform:scaleY(.5)} 50%{transform:scaleY(1)} }
        .relax-card { transition: transform .25s, box-shadow .25s; }
        .relax-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,.12); }
        .play-btn { transition: transform .2s, filter .2s; }
        .play-btn:hover { transform: scale(1.05); filter: brightness(1.08); }
        .play-btn:active { transform: scale(0.96); }
        input[type=range] { -webkit-appearance:none; height:4px; background:rgba(0,0,0,.14); border-radius:2px; outline:none; cursor:pointer; flex:1; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.3); cursor:pointer; }
        .btn-ocean  { background:linear-gradient(135deg,#5b9cf6,#3a75e8); color:#fff; box-shadow:0 4px 16px rgba(74,128,240,.4); }
        .btn-rain   { background:linear-gradient(135deg,#7a8fb8,#4f6590); color:#fff; box-shadow:0 4px 16px rgba(91,122,168,.35); }
        .btn-forest { background:linear-gradient(135deg,#4cd48a,#28a05a); color:#fff; box-shadow:0 4px 16px rgba(56,178,106,.4); }
        .btn-medi   { background:linear-gradient(135deg,#e060f0,#a030c0); color:#fff; box-shadow:0 4px 16px rgba(192,80,216,.4); }
      `}</style>

            <div style={{
                fontFamily: "'Plus Jakarta Sans',sans-serif", background: '#f0f4ff', minHeight: '100vh',
                backgroundImage: 'radial-gradient(ellipse at 20% 10%,#dce8ff 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,#e0f0ea 0%,transparent 50%)',
                paddingBottom: 60
            }}>

                <Navbar />

                {/* Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '28px 40px',
                    maxWidth: 1000, margin: '0 auto'
                }}
                    className="relax-grid">

                    {CARDS.map(card => {
                        const isOn = !!playingIds[card.id];
                        return (
                            <div key={card.id} className="relax-card" style={{
                                borderRadius: 22, padding: '30px 26px 24px',
                                background: card.bg, border: `1.5px solid rgba(255,255,255,${isOn ? 1 : .9})`,
                                boxShadow: isOn ? '0 8px 40px rgba(0,0,0,.13)' : '0 4px 24px rgba(0,0,0,.06)'
                            }}>

                                {/* Icon */}
                                <div style={{
                                    width: 56, height: 56, borderRadius: 15, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: 24, marginBottom: 18,
                                    background: card.iconGrad, boxShadow: '0 4px 14px rgba(0,0,0,.15)'
                                }}>
                                    {card.emoji}
                                </div>

                                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.3rem', color: '#1a1c2e', marginBottom: 6 }}>
                                    {card.title}
                                </h2>
                                <p style={{ fontSize: '.86rem', color: '#5a5f7a', fontWeight: 300, marginBottom: 20, lineHeight: 1.5 }}>
                                    {card.desc}
                                </p>

                                {/* Play/Stop button */}
                                <button
                                    className={`play-btn ${card.btnClass}`}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px',
                                        borderRadius: 50, border: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif",
                                        fontSize: '.88rem', fontWeight: 600, cursor: 'pointer'
                                    }}
                                    onClick={() => toggle(card.id)}
                                >
                                    {isOn ? <><Waveform />&nbsp; Stop</> : '▶ Play'}
                                </button>

                                {/* Volume */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                                    <span style={{ fontSize: '.8rem' }}>🔈</span>
                                    <input type="range" min="0" max="1" step="0.01" defaultValue="0.7"
                                        onChange={e => setVol(card.id, +e.target.value)} />
                                    <span style={{ fontSize: '.8rem' }}>🔊</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Breathing Exercise */}
                <BreathingExercise />
                
                {/* Mind Relaxing Games Section */}
                {activeGame === null ? (
                    <div style={{ maxWidth: 1000, margin: '0 auto 36px', padding: '0 40px' }}>
                        <div style={{ marginBottom: 20 }}>
                            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem', color: '#1a1c2e', marginBottom: 4 }}>
                                Mini Games
                            </h2>
                            <p style={{ fontSize: '.86rem', color: '#5a5f7a', fontWeight: 300, margin: 0 }}>
                                Gentle interactive elements to give your mind a break. Click a game to play.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                            {GAMES_LIST.map(g => (
                                <div key={g.id} className="relax-card" onClick={() => setActiveGame(g.id)} style={{
                                    borderRadius: 22, padding: '24px', background: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 16, border: '1.5px solid rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,.05)'
                                }}>
                                    <div style={{
                                        width: 50, height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', flexShrink: 0,
                                        justifyContent: 'center', fontSize: 22, background: g.bg, boxShadow: `0 4px 14px ${g.shadow}`
                                    }}>{g.icon}</div>
                                    <div>
                                        <h4 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.1rem', margin: '0 0 4px 0', color: '#1a1c2e' }}>{g.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#5a5f7a' }}>{g.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ position: 'relative', width: '100%', maxWidth: 1000, margin: '0 auto 36px' }}>
                        <div style={{ padding: '0 40px', display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                            <button 
                                onClick={() => setActiveGame(null)} 
                                style={{ 
                                    padding: '8px 20px', borderRadius: 50, border: 'none', background: 'rgba(26,28,46,.08)', 
                                    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, 
                                    fontSize: '.85rem', color: '#1a1c2e', transition: 'background .2s'
                                }}>
                                ✕ Close Game
                            </button>
                        </div>
                        {activeGame === 'memory' && <MemoryGame />}
                        {activeGame === 'bubble' && <BubblePop />}
                        {activeGame === 'zenrake' && <ZenRake />}
                        {activeGame === 'starmap' && <StarMap />}
                        {activeGame === 'ripple' && <ColorRipple />}
                        {activeGame === 'lotus' && <LotusPond />}
                    </div>
                )}

                {/* Responsive grid on mobile */}
                <style>{`@media(max-width:640px){.relax-grid{grid-template-columns:1fr !important;padding:16px 20px !important;}}`}</style>

                {/* Toast */}
                <div style={{
                    position: 'fixed', bottom: 24, left: '50%',
                    transform: toast.show ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(70px)',
                    background: 'rgba(26,28,46,.92)', color: '#fff', padding: '11px 24px', borderRadius: 50,
                    fontSize: '.84rem', fontWeight: 500, backdropFilter: 'blur(12px)',
                    transition: 'transform .4s cubic-bezier(.22,.68,0,1.2), opacity .4s',
                    opacity: toast.show ? 1 : 0, pointerEvents: 'none', zIndex: 99
                }}>
                    {toast.msg}
                </div>
            </div>
        </>
    );
}
