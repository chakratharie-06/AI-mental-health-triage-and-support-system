import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Globe, Heart, User, Building2, Wind, BookOpen, BarChart3, ArrowRight, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';

// ─── Data ────────────────────────────────────────────────────────────────────

const STATES = ['National', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'West Bengal'];

const HELPLINES = [
    { name: 'Tele MANAS', number: '14416', description: "Government's free 24/7 mental health helpline, available in all Indian languages.", availability: '24/7', languages: 'All Indian Languages', type: 'National', urgent: true },
    { name: 'Vandrevala Foundation', number: '1860-2662-345', description: 'Crisis intervention and mental health support for individuals and families.', availability: '24/7', languages: 'English, Hindi', type: 'National', urgent: true },
    { name: 'iCall', number: '9152987821', description: 'Psychosocial helpline run by TISS offering counselling and referrals.', availability: 'Mon–Sat, 8 AM–10 PM', languages: 'English, Hindi, Marathi', type: 'National', urgent: false },
    { name: 'NIMHANS Helpline', number: '080-46110007', description: 'Mental health support from India\'s premier neurosciences institute.', availability: '24/7', location: 'Bangalore', type: 'Karnataka', urgent: true },
    { name: 'NIMHANS Emergency', number: '080-26995000', description: 'Emergency psychiatric services at NIMHANS hospital campus.', availability: '24/7', location: 'Bangalore', type: 'Karnataka', urgent: true },
    { name: 'AASRA', number: '91-22-27546669', description: 'Suicide prevention and emotional support for people in crisis.', availability: '24/7', location: 'Mumbai', type: 'Maharashtra', urgent: true },
];

const COUNSELORS = {
    National: [
        { name: 'BetterHelp India', type: 'Online Platform', contact: 'www.betterhelp.com', services: 'Individual therapy, couples therapy, group sessions', languages: 'English, Hindi', isOnline: true },
        { name: 'Practo Mental Health', type: 'Online Directory', contact: 'www.practo.com', services: 'Connects you with verified psychologists & counselors', languages: 'Multiple languages', isOnline: true },
    ],
    Karnataka: [
        { name: 'NIMHANS Counseling Services', type: 'Government Hospital', contact: '080-26995000', address: 'Hosur Road, Bangalore – 560029', services: 'Individual counseling, family therapy, group therapy', languages: 'English, Kannada, Hindi' },
        { name: 'Mpower – The Centre', type: 'Mental Health Center', contact: '1800-120-820050', address: 'Bangalore', services: 'Counseling, therapy, wellness programs', languages: 'English, Kannada' },
    ],
    Maharashtra: [
        { name: 'Mpower – Mumbai', type: 'Mental Health Center', contact: '1800-120-820050', address: 'Mumbai', services: 'Counseling, therapy, psychiatric services', languages: 'English, Hindi, Marathi' },
        { name: 'Tata Institute of Social Sciences', type: 'Counseling Center', contact: '022-25525000', address: 'Mumbai', services: 'Individual and group counseling', languages: 'English, Hindi, Marathi' },
    ],
    'Tamil Nadu': [
        { name: 'SCARF Chennai', type: 'Mental Health Organization', contact: '044-26640353', address: 'Chennai', services: 'Counseling, rehabilitation, family support', languages: 'English, Tamil' },
    ],
    Delhi: [
        { name: 'IHBAS', type: 'Government Hospital', contact: '011-22112222', address: 'Dilshad Garden, Delhi', services: 'Psychiatric services, counseling', languages: 'English, Hindi' },
    ],
    'West Bengal': [
        { name: 'Calcutta Medical Research Institute', type: 'Hospital', contact: '033-23206525', address: 'Kolkata', services: 'Psychiatric consultation, counseling', languages: 'English, Bengali, Hindi' },
    ],
};

const PSYCHIATRISTS = {
    National: [
        { name: 'Practo Psychiatry', type: 'Online Platform', contact: 'www.practo.com', services: 'Online psychiatric consultation, medication management', languages: 'Multiple languages', isOnline: true },
    ],
    Karnataka: [
        { name: 'NIMHANS – Dept. of Psychiatry', type: 'Government Hospital', contact: '080-26995000', address: 'Hosur Road, Bangalore – 560029', services: 'Comprehensive psychiatric care, medication, ECT', languages: 'English, Kannada, Hindi', specialties: 'Depression, Anxiety, Bipolar, Schizophrenia, OCD' },
        { name: 'Spandana Nursing Home', type: 'Private Hospital', contact: '080-26762886', address: 'Bangalore', services: 'Inpatient and outpatient psychiatric services', languages: 'English, Kannada' },
    ],
    Maharashtra: [
        { name: 'Lokmanya Tilak Municipal Hospital', type: 'Government Hospital', contact: '022-24076789', address: 'Sion, Mumbai', services: 'Psychiatric OPD, emergency services', languages: 'English, Hindi, Marathi' },
    ],
    'Tamil Nadu': [
        { name: 'Institute of Mental Health', type: 'Government Hospital', contact: '044-25281010', address: 'Chennai', services: 'Psychiatric treatment, rehabilitation', languages: 'English, Tamil' },
    ],
    Delhi: [
        { name: 'AIIMS – Psychiatry Dept.', type: 'Government Hospital', contact: '011-26588500', address: 'Ansari Nagar, New Delhi', services: 'Comprehensive psychiatric care', languages: 'English, Hindi' },
    ],
    'West Bengal': [
        { name: 'Pavlov Hospital', type: 'Private Hospital', contact: '033-24730001', address: 'Kolkata', services: 'Psychiatric treatment, de-addiction', languages: 'English, Bengali, Hindi' },
    ],
};

const SELF_HELP = [
    { label: 'Guided Relaxation', sub: 'Breathe, decompress, and reset', icon: Wind, to: '/relax', color: 'from-teal-400 to-cyan-500' },
    { label: 'Private Journal', sub: 'Put your thoughts into words', icon: BookOpen, to: '/journal', color: 'from-violet-400 to-purple-500' },
    { label: 'Mood Log', sub: 'Track how you feel each day', icon: Heart, to: '/mood', color: 'from-rose-400 to-pink-500' },
    { label: 'Wellness Insights', sub: 'See your emotional patterns', icon: BarChart3, to: '/analytics', color: 'from-amber-400 to-orange-500' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
    <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">{children}</h2>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

const HelplinerCard = ({ h, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`bg-white border rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow ${h.urgent ? 'border-l-4 border-l-rose-400 border-gray-200' : 'border-gray-200'}`}
    >
        <div>
            <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-base leading-snug">{h.name}</h3>
                {h.urgent && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 shrink-0">24/7 Crisis</span>}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{h.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
            {h.availability && (
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {h.availability}</span>
            )}
            {h.languages && (
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {h.languages}</span>
            )}
            {h.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {h.location}</span>
            )}
        </div>

        <a
            href={`tel:${h.number}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-rose-100"
        >
            <Phone className="w-4 h-4" />
            Call {h.number}
        </a>
    </motion.div>
);

const ProviderCard = ({ p, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
    >
        <div>
            <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-base leading-snug">{p.name}</h3>
                {p.isOnline && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 shrink-0">Online</span>}
            </div>
            <span className="inline-block text-xs font-medium text-gray-400 mb-2">{p.type}</span>
            <p className="text-sm text-gray-600 leading-relaxed">{p.services}</p>
            {p.specialties && (
                <p className="text-xs text-gray-400 mt-1.5">Specialises in: <span className="text-gray-600">{p.specialties}</span></p>
            )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
            {p.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.address}</span>}
            {p.languages && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{p.languages}</span>}
        </div>

        {p.isOnline ? (
            <a
                href={`https://${p.contact}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:border-violet-400 hover:text-violet-700 text-gray-700 text-sm font-semibold rounded-xl transition-all"
            >
                Visit Website <ExternalLink className="w-3.5 h-3.5" />
            </a>
        ) : (
            <a
                href={`tel:${p.contact}`}
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:border-violet-400 hover:text-violet-700 text-gray-700 text-sm font-semibold rounded-xl transition-all"
            >
                <Phone className="w-4 h-4" /> {p.contact}
            </a>
        )}
    </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const ResourcesPage = () => {
    const [distressStatus, setDistressStatus] = useState(null);
    const [selectedState, setSelectedState] = useState('National');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/user-distress-status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDistressStatus(res.data);
            } catch (err) {
                console.error('Could not load distress status:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const filteredHelplines = HELPLINES.filter(h =>
        h.type === 'National' || h.type === selectedState
    );

    const filteredCounselors = [
        ...(COUNSELORS['National'] || []),
        ...(selectedState !== 'National' ? (COUNSELORS[selectedState] || []) : [])
    ];

    const filteredPsychiatrists = [
        ...(PSYCHIATRISTS['National'] || []),
        ...(selectedState !== 'National' ? (PSYCHIATRISTS[selectedState] || []) : [])
    ];

    const showCounselors = !distressStatus || ['counselor', 'psychiatrist'].includes(distressStatus.recommendation) || distressStatus.category === 'high';
    const showPsychiatrists = !distressStatus || distressStatus.recommendation === 'psychiatrist';

    // Distress level color
    const distressColor = distressStatus
        ? distressStatus.distress_level >= 7 ? 'bg-rose-50 border-rose-200 text-rose-800'
        : distressStatus.distress_level >= 4 ? 'bg-amber-50 border-amber-200 text-amber-800'
        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : '';

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-12">

                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="max-w-2xl">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                        Support & Resources
                    </h1>
                    <p className="text-gray-500 text-base leading-relaxed">
                        Whether you need someone to talk to right now or want to find professional support near you—
                        you're in the right place. You don't have to figure this out alone.
                    </p>
                </div>

                {/* ── AI Triage Card ─────────────────────────────────────── */}
                {!loading && distressStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl border p-6 flex gap-5 items-start ${distressColor}`}
                    >
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center">
                            {distressStatus.recommendation === 'psychiatrist' ? <Building2 className="w-5 h-5" /> :
                             distressStatus.recommendation === 'counselor'    ? <User className="w-5 h-5" /> :
                             <Heart className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">Your personalised recommendation</p>
                            <p className="text-sm leading-relaxed opacity-90 mb-3">{distressStatus.message}</p>
                            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium opacity-75">
                                <span>Distress level: {distressStatus.distress_level}/10</span>
                                <span>Category: <span className="capitalize">{distressStatus.category}</span></span>
                                <span>Based on {distressStatus.total_messages} recent messages</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Location Pill Tabs ─────────────────────────────────── */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> Filter by location
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {STATES.map(state => (
                            <button
                                key={state}
                                onClick={() => setSelectedState(state)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                                    selectedState === state
                                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-700'
                                }`}
                            >
                                {state}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Emergency Helplines ────────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-2 h-6 bg-rose-500 rounded-full" />
                        <h2 className="text-xl font-bold text-gray-900">Emergency Helplines</h2>
                        <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">Always available</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        If you're in crisis or need to speak with someone immediately, please reach out. These helplines are free, confidential, and available to you.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredHelplines.map((h, i) => (
                            <HelplinerCard key={i} h={h} index={i} />
                        ))}
                    </div>
                </section>

                {/* ── Counselors ─────────────────────────────────────────── */}
                {showCounselors && (
                    <section>
                        <SectionLabel>Professional Counselors</SectionLabel>
                        <p className="text-sm text-gray-500 mb-6">
                            Speaking with a trained counselor can help you work through stress, anxiety, or difficult emotions in a safe, non-judgmental space.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredCounselors.map((p, i) => (
                                <ProviderCard key={i} p={p} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Psychiatrists ──────────────────────────────────────── */}
                {showPsychiatrists && (
                    <section>
                        <SectionLabel>Psychiatrists & Hospitals</SectionLabel>
                        <p className="text-sm text-gray-500 mb-6">
                            If you're dealing with more severe symptoms or need medication support, a psychiatrist can provide the right clinical care.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPsychiatrists.map((p, i) => (
                                <ProviderCard key={i} p={p} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Self-Help Shortcuts ────────────────────────────────── */}
                <section>
                    <SectionLabel>Take care of yourself today</SectionLabel>
                    <p className="text-sm text-gray-500 mb-6">
                        Small daily habits make a real difference. Here are a few things built right into Care Nest to help you through the week.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SELF_HELP.map(({ label, sub, icon: Icon, to, color }, i) => (
                            <Link
                                key={i}
                                to={to}
                                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3 group"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{label}</p>
                                    <p className="text-xs text-gray-500 leading-snug mt-0.5">{sub}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors mt-auto" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── Emergency Disclaimer Footer ────────────────────────── */}
                <div className="flex items-start gap-3 p-5 bg-white border border-amber-200 rounded-2xl">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 leading-relaxed">
                        <strong className="text-gray-900">If you are in immediate danger,</strong> please call emergency services at <strong>112</strong> or go to your nearest hospital without delay. Mental health crises are medical emergencies — please reach out.
                    </p>
                </div>

            </main>
        </div>
    );
};

export default ResourcesPage;
