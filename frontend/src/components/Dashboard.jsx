import React from 'react';

const Dashboard = ({ expenses }) => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="glass-panel fade-in" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(30, 41, 59, 0.7))' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Expenses</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>
                    ${total.toFixed(2)}
                </div>
            </div>
            <div className="glass-panel fade-in" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Transaction Count</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {expenses.length}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
