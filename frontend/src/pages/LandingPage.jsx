import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Heart, Shield, Users, Sparkles, ArrowRight,
    MessageCircle, BookOpen, Wind, BarChart3, CheckCircle2, Phone
} from 'lucide-react';

// ─── Feature Strip Data ───────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: MessageCircle,
        title: 'Talk to an AI that actually listens',
        description: 'No judgement. No wait times. An empathetic AI trained to understand emotion, distress, and the way people really talk—especially in India.',
        color: 'bg-violet-50 text-violet-600',
    },
    {
        icon: BookOpen,
        title: 'Journal your thoughts privately',
        description: 'A safe space to write freely. Your entries are encrypted, completely private, and analysed gently to help you understand your emotional state.',
        color: 'bg-indigo-50 text-indigo-600',
    },
    {
        icon: Wind,
        title: 'Relax when everything feels like too much',
        description: 'Guided breathing exercises, ambient sounds, and grounding techniques—right when you need them.',
        color: 'bg-teal-50 text-teal-600',
    },
    {
        icon: BarChart3,
        title: 'Track your emotional wellbeing over time',
        description: 'Understand your mood patterns and usage trends through a clean, clinical dashboard that shows you real progress.',
        color: 'bg-fuchsia-50 text-fuchsia-600',
    },
];

const TRUST_POINTS = [
    'All conversations are fully encrypted',
    'Anonymous access—no personal details required',
    'Crisis detection with helpline redirection (Tele MANAS 14416)',
    'AI support, not a replacement for professional therapy',
    'Designed for Indian users in 8 languages',
];

const LANGUAGES = ['English', 'हिंदी', 'தமிழ்', 'తెలుగు', 'ಕನ್ನಡ', 'മലയാളം', 'বাংলা', 'मराठी'];

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

// ─── Component ────────────────────────────────────────────────────────────────
function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {/* ── Dot Grid Background ─────────────────────────── */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)
                    `,
                    backgroundSize: '44px 44px',
                    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)'
                }}
            />

            {/* ── Navbar ──────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-sm">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-gray-900">Care Nest</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Features</a>
                        <a href="#trust" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Privacy</a>
                        <a href="#languages" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Languages</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/signin')}
                            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Hero ────────────────────────────────────────────────────── */}
            <section className="relative z-10 px-6 pt-24 pb-20 max-w-6xl mx-auto">
                {/* Background gradient orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-violet-100/60 to-transparent blur-3xl pointer-events-none rounded-full" />

                <div className="relative text-center">
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="show"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-full text-violet-700 text-sm font-semibold mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                        Available 24/7 · Free to use · Completely private
                    </motion.div>

                    <motion.h1
                        variants={fadeUp} initial="hidden" animate="show" custom={1}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.08]"
                    >
                        Mental health support{' '}
                        <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                            that understands you.
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp} initial="hidden" animate="show" custom={2}
                        className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Care Nest is an AI-powered mental wellness companion designed for India.
                        Talk, journal, breathe, track—your way, in your language, on your terms.
                    </motion.p>

                    <motion.div
                        variants={fadeUp} initial="hidden" animate="show" custom={3}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={() => navigate('/age-gate')}
                            className="flex items-center gap-2 px-7 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200 text-base"
                        >
                            Start for free
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate('/signin')}
                            className="px-7 py-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-2xl transition-all text-base shadow-sm hover:shadow"
                        >
                            I already have an account
                        </button>
                    </motion.div>

                    {/* Emergency pull-quote */}
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="show" custom={4}
                        className="mt-10 inline-flex items-center gap-2 text-sm text-gray-400"
                    >
                        <Phone className="w-4 h-4 text-rose-400" />
                        In crisis?  Call Tele MANAS <strong className="text-rose-500 font-bold">14416</strong> — free, 24/7, all Indian languages
                    </motion.div>
                </div>
            </section>

            {/* ── Feature Strip ────────────────────────────────────────────── */}
            <section id="features" className="px-6 py-20 bg-gray-50/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                            Everything you need in one place
                        </h2>
                        <p className="text-gray-500 text-base max-w-xl mx-auto">
                            Built around how people in India actually experience stress—not a one-size-fits-all Western model.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.5}
                                className="bg-white border border-gray-200 rounded-2xl p-7 hover:shadow-md transition-shadow flex gap-5"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1.5">{f.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Trust & Privacy ──────────────────────────────────────────── */}
            <section id="trust" className="px-6 py-20">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
                    <div>
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-500 mb-4">Privacy & Safety</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 tracking-tight leading-snug">
                            Your wellbeing data<br />belongs only to you.
                        </h2>
                        <p className="text-gray-500 text-base leading-relaxed mb-8">
                            We designed Care Nest around a simple principle: you should be able to seek help without worrying about who's watching. Every interaction is private by design.
                        </p>
                        <button
                            onClick={() => navigate('/age-gate', { state: { anonymous: true } })}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all"
                        >
                            Try it anonymously <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {TRUST_POINTS.map((point, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.3}
                                className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl"
                            >
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700 font-medium">{point}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Languages ────────────────────────────────────────────────── */}
            <section id="languages" className="px-6 py-20 bg-gray-50/50">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-500 mb-4">Multilingual Support</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        Talk in the language<br />you think in.
                    </h2>
                    <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto">
                        Mental health conversations are deeply personal. Care Nest works fluently in 8 Indian languages, including code-mixing like Hinglish.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {LANGUAGES.map((lang, i) => (
                            <motion.span
                                key={lang}
                                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.1}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 shadow-sm"
                            >
                                {lang}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ────────────────────────────────────────────────── */}
            <section className="px-6 py-24">
                <motion.div
                    variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-12 shadow-2xl shadow-violet-200"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
                        You don't have to wait<br />until you're in crisis.
                    </h2>
                    <p className="text-violet-100 text-base mb-8 max-w-md mx-auto">
                        Start checking in now. Five minutes a day of honest self-reflection can change how you understand yourself.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-7 py-3.5 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-all text-sm shadow-sm"
                        >
                            Create a free account
                        </button>
                        <button
                            onClick={() => navigate('/signin')}
                            className="px-7 py-3.5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-sm"
                        >
                            Sign in
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <footer className="px-6 py-8 border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Care Nest</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                        © 2026 Care Nest · Empathetic mental health support for India · Not a substitute for professional therapy.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold">
                        <Phone className="w-3.5 h-3.5" />
                        Crisis Line: 14416
                    </div>
                </div>
            </footer>

        </div>
    );
}

export default LandingPage;
