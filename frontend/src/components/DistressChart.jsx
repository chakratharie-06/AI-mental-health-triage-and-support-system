import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DistressChart = ({ data }) => {
    if (!data || !Array.isArray(data)) return <div className="p-4 text-center text-gray-400">No data available</div>;

    // Format data for chart
    const chartData = data.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        level: item.distress_level,
        fullDate: new Date(item.timestamp).toLocaleString()
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const level = payload[0].value;
            let status = "Stable";
            let color = "text-green-600";
            if (level >= 3) { status = "High Distress"; color = "text-red-600"; }
            else if (level >= 2) { status = "Elevated"; color = "text-yellow-600"; }

            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">{payload[0].payload.fullDate}</p>
                    <p className="font-bold text-gray-800">Distress Level: {level}/4</p>
                    <p className={`text-sm font-medium ${color}`}>{status}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="distressGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: '#999' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 4]}
                        ticks={[0, 1, 2, 3, 4]}
                        tick={{ fontSize: 10, fill: '#999' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="level"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#distressGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DistressChart;
