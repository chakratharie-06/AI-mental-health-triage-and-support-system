import React from 'react';
import { Flame, AlertCircle, TrendingDown, RefreshCw } from 'lucide-react';

export default function BurnoutPredictor({ stressLevel = 65 }) {
    // Determine burnout status based on stress level (0-100)
    let statusText = 'Optimal';
    let statusColor = 'text-emerald-600';
    let bgPulse = 'bg-emerald-500';
    let barColor = 'bg-emerald-500';

    if (stressLevel >= 80) {
        statusText = 'High Risk of Burnout';
        statusColor = 'text-rose-600';
        bgPulse = 'bg-rose-500 animate-pulse';
        barColor = 'bg-gradient-to-r from-orange-400 to-rose-600';
    } else if (stressLevel >= 60) {
        statusText = 'Elevated Stress';
        statusColor = 'text-amber-600';
        bgPulse = 'bg-amber-500';
        barColor = 'bg-gradient-to-r from-amber-400 to-orange-500';
    }

    return (
        <div className="card border border-gray-100 shadow-sm relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Flame className="w-32 h-32" />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-heading font-semibold text-gray-900 leading-tight">Burnout Predictor</h3>
                        <p className="text-xs text-gray-500">Based on recent chat & mood patterns</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                    <RefreshCw className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">Live</span>
                </div>
            </div>

            <div className="mb-6 relative z-10">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Current Status</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${bgPulse}`}></div>
                            <span className={`font-bold text-lg ${statusColor}`}>{statusText}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">{stressLevel}</span>
                        <span className="text-sm text-gray-500"> /100</span>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                        style={{ width: `${stressLevel}%` }}
                    ></div>
                </div>
                
                <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    <span>Balanced</span>
                    <span>Strained</span>
                    <span>Burnout</span>
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100/60 relative z-10">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    {stressLevel >= 60 ? <AlertCircle className="w-4 h-4 text-amber-500" /> : <TrendingDown className="w-4 h-4 text-emerald-500" />}
                    Insight
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {stressLevel >= 80 
                        ? 'Your chat patterns indicate deep exhaustion. Consider stepping away from work obligations for a minimum of 24 hours to recover cognitive load.' 
                        : stressLevel >= 60 
                        ? 'You are carrying sustained micro-stressors. Schedule a strict hard-stop for work today and focus on passive recovery tonight.' 
                        : 'Your emotional load is stable and manageable. Keep maintaining your current work-life boundaries.'}
                </p>
            </div>
        </div>
    );
}
