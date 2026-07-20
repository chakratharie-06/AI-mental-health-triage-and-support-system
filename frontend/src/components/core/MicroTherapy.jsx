import React, { useState } from 'react';
import { Play, Pause, Headphones, Coffee, CheckCircle2, Focus } from 'lucide-react';

const SESSIONS = [
    { id: 1, title: '2-Min Box Breathing', duration: '2 min', icon: Focus, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 2, title: 'Desk Body Scan', duration: '4 min', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 3, title: 'Meeting Prep Calm', duration: '3 min', icon: Headphones, color: 'text-violet-500', bg: 'bg-violet-50' },
    { id: 4, title: 'Workday Transition', duration: '5 min', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50' }
];

export default function MicroTherapy() {
    const [activeSession, setActiveSession] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleSession = (id) => {
        if (activeSession === id) {
            setIsPlaying(!isPlaying);
        } else {
            setActiveSession(id);
            setIsPlaying(true);
            // In a real implementation, this would trigger an audio file or an animated breathing guide
        }
    };

    return (
        <div className="card border border-gray-100 shadow-sm bg-white flex flex-col h-full">
            <div className="mb-5">
                <h3 className="font-heading font-semibold text-gray-900 leading-tight">Micro-Therapy</h3>
                <p className="text-sm text-gray-500 mt-1">Quick emotional recovery for tight schedules</p>
            </div>

            <div className="space-y-3 flex-1">
                {SESSIONS.map((session) => {
                    const Icon = session.icon;
                    const isActive = activeSession === session.id;

                    return (
                        <div 
                            key={session.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                                isActive ? 'border-primary-200 bg-primary-50/50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer'
                            }`}
                            onClick={() => !isActive && toggleSession(session.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${session.bg}`}>
                                    <Icon className={`w-4 h-4 ${session.color}`} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-semibold ${isActive ? 'text-primary-700' : 'text-gray-800'}`}>
                                        {session.title}
                                    </h4>
                                    <p className="text-xs text-gray-500">{session.duration} • Guided Focus</p>
                                </div>
                            </div>

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSession(session.id);
                                }}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                                    isActive 
                                    ? 'bg-primary-600 border-primary-600 text-white' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                }`}
                            >
                                {isActive && isPlaying ? (
                                    <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                    <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
            
            <button className="w-full mt-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                View All Sessions
            </button>
        </div>
    );
}
