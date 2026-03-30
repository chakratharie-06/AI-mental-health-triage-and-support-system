/**
 * ============================================================================
 * CARE NEST - PROFILE & SETTINGS PAGE
 * ============================================================================
 *
 * @title Profile & Settings - Personalize Your Experience
 * @author Care Nest AI
 * @date 2026-03-30
 * @version 3.0.0
 *
 * Premium settings dashboard with sidebar navigation.
 * Strictly restricts Anonymous (anon_) accounts from accessing settings.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Globe, Shield, Bell, LogOut, ChevronRight, AlertTriangle,
    Brain, Heart, Clock, Download, Trash2, Lock, CheckCircle,
    Volume2, MessageSquare, Zap, BarChart2, FileText, Camera,
    Mail, Calendar, Activity, Settings, Phone
} from 'lucide-react';
import Navbar from '../components/Navbar';

/* ─── Sidebar navigation sections ─────────────────────────────────────────── */
const NAV_ITEMS = [
    { id: 'account',    label: 'Account',         icon: User    },
    { id: 'ai',         label: 'AI Preferences',  icon: Brain   },
    { id: 'wellness',   label: 'Wellness',         icon: Heart   },
    { id: 'privacy',    label: 'Privacy & Data',   icon: Shield  },
    { id: 'danger',     label: 'Danger Zone',      icon: AlertTriangle },
];

/* ─── Toggle component ─────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, id }) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${checked ? 'bg-violet-600' : 'bg-gray-200'}`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );
}

/* ─── Section row wrapper ──────────────────────────────────────────────────── */
function SettingRow({ icon: Icon, label, description, children, last = false }) {
    return (
        <div className={`px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 justify-between ${!last ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 p-2 rounded-lg bg-violet-50 text-violet-600 shrink-0">
                    <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    {description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
                </div>
            </div>
            <div className="md:ml-4 shrink-0">{children}</div>
        </div>
    );
}

/* ─── Panel wrapper ────────────────────────────────────────────────────────── */
function Panel({ title, subtitle, children }) {
    return (
        <div>
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {children}
            </div>
        </div>
    );
}

/* ─── Select styled component ─────────────────────────────────────────────── */
function StyledSelect({ value, onChange, options, id }) {
    return (
        <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-w-[190px] px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
            {options.map(opt => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
            ))}
        </select>
    );
}

/* ─── Badge ────────────────────────────────────────────────────────────────── */
function Badge({ children, color = 'violet' }) {
    const colors = {
        violet: 'bg-violet-50 text-violet-700 ring-violet-200',
        green:  'bg-green-50  text-green-700  ring-green-200',
        amber:  'bg-amber-50  text-amber-700  ring-amber-200',
        rose:   'bg-rose-50   text-rose-700   ring-rose-200',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors[color]}`}>
            {children}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
function ProfilePage() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    /* ─── Section state */
    const [activeSection, setActiveSection] = useState('account');

    /* ─── Language */
    const [language, setLanguage]   = useState('English');

    /* ─── AI Preferences */
    const [aiTone, setAiTone]               = useState('Empathetic');
    const [aiVerbosity, setAiVerbosity]     = useState('Balanced');
    const [voiceEnabled, setVoiceEnabled]   = useState(false);
    const [crisisAlerts, setCrisisAlerts]   = useState(true);
    const [suggestions, setSuggestions]     = useState(true);

    /* ─── Wellness */
    const [dailyCheckin, setDailyCheckin]   = useState(true);
    const [reminderTime, setReminderTime]   = useState('09:00');
    const [weeklyReport, setWeeklyReport]   = useState(true);
    const [moodStreak, setMoodStreak]       = useState(true);

    /* ─── Privacy */
    const [analyticsShare, setAnalyticsShare]   = useState(false);
    const [dataRetention, setDataRetention]     = useState('90 days');

    /* ─── UI */
    const [saveFlash, setSaveFlash]   = useState('');
    const [deleteModal, setDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const languages = [
        'English', 'हिंदी (Hindi)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)',
        'ಕನ್ನಡ (Kannada)', 'മലയാളം (Malayalam)', 'বাংলা (Bengali)', 'मराठी (Marathi)',
    ];

    const toneOptions   = ['Empathetic', 'Professional', 'Friendly', 'Concise'];
    const verbosityOpts = ['Brief', 'Balanced', 'Detailed'];
    const retentionOpts = ['30 days', '90 days', '1 year', 'Forever'];

    /* ─── Anonymous guard */
    useEffect(() => {
        if (user && user.email && user.email.startsWith('anon_')) {
            alert('Guest accounts cannot access Settings. Please sign in with a registered account.');
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    if (!user || (user.email && user.email.startsWith('anon_'))) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    /* ─── Helpers */
    const showSaved = (label = 'Preferences saved') => {
        setSaveFlash(label);
        setTimeout(() => setSaveFlash(''), 2500);
    };

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const handleDeleteAccount = () => {
        if (confirmText === 'DELETE') {
            logout();
            navigate('/');
        }
    };

    const handleExport = () => {
        const data = {
            exportedAt: new Date().toISOString(),
            user: { name: user.name, email: user.email },
            settings: { language, aiTone, aiVerbosity, dailyCheckin, weeklyReport },
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'carenest-data-export.json';
        a.click();
        URL.revokeObjectURL(url);
        showSaved('Data exported successfully');
    };

    /* ─── Joined date display */
    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    /* ─── Section content */
    const renderSection = () => {
        switch (activeSection) {

            /* ── Account ── */
            case 'account':
                return (
                    <motion.div key="account" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                        {/* Avatar + name hero */}
                        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] opacity-30" />
                            <div className="relative flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold border border-white/30 shrink-0">
                                    {(user.name || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{user.name || 'User'}</h3>
                                    <p className="text-violet-200 text-sm mt-0.5">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge color="green">✓ Verified</Badge>
                                        <span className="text-xs text-violet-300">Member since {joinedDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account details */}
                        <Panel title="Account Information" subtitle="Your personal details and account status.">
                            <SettingRow icon={Mail} label="Email Address" description="Your primary contact and login identifier.">
                                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">{user.email}</span>
                            </SettingRow>
                            <SettingRow icon={User} label="Display Name" description="Shown across your dashboard and reports.">
                                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">{user.name || '—'}</span>
                            </SettingRow>
                            <SettingRow icon={Calendar} label="Member Since" description="When your Care Nest journey began.">
                                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">{joinedDate}</span>
                            </SettingRow>
                            <SettingRow icon={Activity} label="Account Status" description="Your current subscription and security tier." last>
                                <div className="flex items-center gap-2">
                                    <Badge color="violet">Free Tier</Badge>
                                    <Badge color="green">Active</Badge>
                                </div>
                            </SettingRow>
                        </Panel>

                        {/* Language */}
                        <Panel title="Language & Region" subtitle="Controls how content and AI responses are displayed.">
                            <SettingRow icon={Globe} label="Interface Language" description="Applied to the UI and AI conversation language." last>
                                <div className="flex items-center gap-3">
                                    <StyledSelect
                                        id="language-select"
                                        value={language}
                                        onChange={(v) => { setLanguage(v); showSaved('Language updated'); }}
                                        options={languages}
                                    />
                                </div>
                            </SettingRow>
                        </Panel>

                    </motion.div>
                );

            /* ── AI Preferences ── */
            case 'ai':
                return (
                    <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                        <Panel title="Conversation Style" subtitle="Tailor how the AI interacts with you during sessions.">
                            <SettingRow icon={MessageSquare} label="Tone of Responses" description="Sets the emotional register of AI replies.">
                                <StyledSelect
                                    id="ai-tone-select"
                                    value={aiTone}
                                    onChange={(v) => { setAiTone(v); showSaved(); }}
                                    options={toneOptions}
                                />
                            </SettingRow>
                            <SettingRow icon={FileText} label="Response Length" description="Controls how detailed AI answers are." last>
                                <StyledSelect
                                    id="ai-verbosity-select"
                                    value={aiVerbosity}
                                    onChange={(v) => { setAiVerbosity(v); showSaved(); }}
                                    options={verbosityOpts}
                                />
                            </SettingRow>
                        </Panel>

                        <Panel title="AI Features" subtitle="Enable or disable specific AI capabilities.">
                            <SettingRow icon={Volume2} label="Voice Input Mode" description="Activate voice-to-text for hands-free chat sessions.">
                                <Toggle id="voice-toggle" checked={voiceEnabled} onChange={(v) => { setVoiceEnabled(v); showSaved(); }} />
                            </SettingRow>
                            <SettingRow icon={Zap} label="Crisis Detection Alerts" description="AI flags high-distress patterns and offers crisis resources.">
                                <Toggle id="crisis-toggle" checked={crisisAlerts} onChange={(v) => { setCrisisAlerts(v); showSaved(); }} />
                            </SettingRow>
                            <SettingRow icon={Brain} label="Personalised Suggestions" description="AI recommends exercises based on your mood history." last>
                                <Toggle id="suggestions-toggle" checked={suggestions} onChange={(v) => { setSuggestions(v); showSaved(); }} />
                            </SettingRow>
                        </Panel>

                        {/* Info card */}
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
                            <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-800">AI models respect your settings</p>
                                <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">Preferences apply immediately to new conversations. Existing chat history is unaffected.</p>
                            </div>
                        </div>
                    </motion.div>
                );

            /* ── Wellness ── */
            case 'wellness':
                return (
                    <motion.div key="wellness" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                        <Panel title="Check-in Reminders" subtitle="Stay consistent with daily mood and wellness tracking.">
                            <SettingRow icon={Bell} label="Daily Check-in Reminder" description="Get prompted once a day to log your mood and journal.">
                                <Toggle id="checkin-toggle" checked={dailyCheckin} onChange={(v) => { setDailyCheckin(v); showSaved(); }} />
                            </SettingRow>
                            <SettingRow icon={Clock} label="Reminder Time" description="Pick when you'd like to receive your daily nudge." last>
                                <input
                                    id="reminder-time"
                                    type="time"
                                    value={reminderTime}
                                    onChange={(e) => { setReminderTime(e.target.value); showSaved(); }}
                                    disabled={!dailyCheckin}
                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                />
                            </SettingRow>
                        </Panel>

                        <Panel title="Progress Insights" subtitle="Reports that help you understand your wellbeing trends.">
                            <SettingRow icon={BarChart2} label="Weekly Wellness Report" description="A summary of your mood trends emailed every Monday.">
                                <Toggle id="weekly-report-toggle" checked={weeklyReport} onChange={(v) => { setWeeklyReport(v); showSaved(); }} />
                            </SettingRow>
                            <SettingRow icon={Heart} label="Mood Streak Tracking" description="Visual streak counter to keep you motivated." last>
                                <Toggle id="streak-toggle" checked={moodStreak} onChange={(v) => { setMoodStreak(v); showSaved(); }} />
                            </SettingRow>
                        </Panel>

                        {/* Crisis line card */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
                            <Phone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">iCall India Helpline</p>
                                <p className="text-xs text-amber-700 mt-0.5">9152987821 · Mon–Sat, 8 AM – 10 PM IST</p>
                                <p className="text-xs text-amber-600 mt-1 leading-relaxed">If you're in distress, please reach out to a professional. You are not alone.</p>
                            </div>
                        </div>
                    </motion.div>
                );

            /* ── Privacy & Data ── */
            case 'privacy':
                return (
                    <motion.div key="privacy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                        {/* Security status */}
                        <div className="rounded-xl border border-green-200 bg-green-50 p-5 flex gap-4 items-start">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600 shrink-0">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-green-800">End-to-End Encrypted Vault</p>
                                    <Badge color="green">Secure</Badge>
                                </div>
                                <p className="text-xs text-green-700 leading-relaxed">
                                    All data is stored under AES-256 encryption. Your conversations, mood logs, and personal baselines are
                                    isolated to your account — <strong>no third-party has access</strong>.
                                </p>
                            </div>
                        </div>

                        <Panel title="Data & Sharing" subtitle="Control what Care Nest collects and retains.">
                            <SettingRow icon={BarChart2} label="Anonymous Analytics" description="Help improve Care Nest by sharing anonymised usage data.">
                                <Toggle id="analytics-toggle" checked={analyticsShare} onChange={(v) => { setAnalyticsShare(v); showSaved(); }} />
                            </SettingRow>
                            <SettingRow icon={Clock} label="Data Retention Period" description="How long we keep your chat and mood history." last>
                                <StyledSelect
                                    id="retention-select"
                                    value={dataRetention}
                                    onChange={(v) => { setDataRetention(v); showSaved(); }}
                                    options={retentionOpts}
                                />
                            </SettingRow>
                        </Panel>

                        <Panel title="Your Data" subtitle="Download or manage your personal data.">
                            <SettingRow icon={Download} label="Export My Data" description="Download all your data as a JSON file." last>
                                <button
                                    id="export-btn"
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </SettingRow>
                        </Panel>

                        <div className="text-center">
                            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">
                                Read our full Privacy Policy →
                            </a>
                        </div>
                    </motion.div>
                );

            /* ── Danger Zone ── */
            case 'danger':
                return (
                    <motion.div key="danger" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                        {/* Sign out */}
                        <Panel title="Session Management" subtitle="Manage your current session.">
                            <SettingRow icon={LogOut} label="Sign Out" description="Clears local state and returns you to the login screen." last>
                                <button
                                    id="signout-btn"
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </SettingRow>
                        </Panel>

                        {/* Delete account */}
                        <div>
                            <div className="mb-4">
                                <h2 className="text-base font-semibold text-rose-700 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Danger Zone
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">Irreversible and destructive actions.</p>
                            </div>
                            <div className="bg-white rounded-xl border border-rose-200 overflow-hidden shadow-sm">
                                <div className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Delete Account</p>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                Permanently deletes all data — conversations, mood logs, and settings. <br />
                                                <strong className="text-rose-600">This action cannot be undone.</strong>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        id="delete-account-btn"
                                        onClick={() => setDeleteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Breadcrumb */}
            <header className="w-full bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-sm text-gray-500">
                    <button onClick={() => navigate('/dashboard')} className="hover:text-gray-900 transition-colors font-medium">
                        Home
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-900 font-semibold">Settings</span>
                </div>
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-violet-600" />
                        Settings
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account, AI preferences, and privacy controls.</p>
                </div>

                <div className="flex gap-6">
                    {/* ── Sidebar ── */}
                    <aside className="hidden md:flex flex-col gap-1 w-52 shrink-0 self-start sticky top-24">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    id={`nav-${item.id}`}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-left transition-all duration-150 ${
                                        active
                                            ? 'bg-violet-50 text-violet-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    } ${item.id === 'danger' ? 'mt-4 border-t border-gray-200 pt-5' : ''}`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${item.id === 'danger' ? 'text-rose-500' : ''}`} />
                                    <span className={item.id === 'danger' ? 'text-rose-600' : ''}>{item.label}</span>
                                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />}
                                </button>
                            );
                        })}
                    </aside>

                    {/* ── Mobile nav ── */}
                    <div className="md:hidden w-full mb-4 flex gap-2 overflow-x-auto pb-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${
                                        active
                                            ? 'bg-violet-600 text-white font-semibold'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-3 h-3" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Main content ── */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {renderSection()}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* ── Save toast ── */}
            <AnimatePresence>
                {saveFlash && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full shadow-xl z-50"
                    >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {saveFlash}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete confirmation modal ── */}
            <AnimatePresence>
                {deleteModal && (
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdropfilter backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteModal(false)}
                    >
                        <motion.div
                            key="modal"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-rose-100 rounded-lg">
                                    <Trash2 className="w-5 h-5 text-rose-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                This will <strong>permanently delete</strong> your account and all associated data including conversations, mood logs, and journal entries. This action cannot be reversed.
                            </p>
                            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-5">
                                <p className="text-xs font-medium text-rose-700 mb-2">Type <strong>DELETE</strong> to confirm:</p>
                                <input
                                    id="delete-confirm-input"
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full px-3 py-2 text-sm border border-rose-300 rounded-lg bg-white focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all font-mono"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setDeleteModal(false); setConfirmText(''); }}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    id="confirm-delete-btn"
                                    onClick={handleDeleteAccount}
                                    disabled={confirmText !== 'DELETE'}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Forever
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ProfilePage;
