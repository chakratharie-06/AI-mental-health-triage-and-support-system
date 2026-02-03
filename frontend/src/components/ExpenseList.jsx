import React from 'react';

const ExpenseList = ({ expenses, onDeleteExpense }) => {
    if (expenses.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <p>No transactions yet. Add one above!</p>
            </div>
        );
    }

    return (
        <div className="glass-panel fade-in" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Recent Transactions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {expenses.map((expense) => (
                    <div key={expense.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'rgba(15, 23, 42, 0.4)',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(129, 140, 248, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                fontSize: '1.2rem'
                            }}>
                                {getCategoryIcon(expense.category)}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{expense.title}</h4>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                    {expense.date} • {expense.category}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>
                                -${expense.amount.toFixed(2)}
                            </span>
                            <button
                                onClick={() => onDeleteExpense(expense.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    opacity: 0.7,
                                    transition: 'opacity 0.2s',
                                    padding: '4px'
                                }}
                                onMouseOver={(e) => e.target.style.opacity = 1}
                                onMouseOut={(e) => e.target.style.opacity = 0.7}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const getCategoryIcon = (category) => {
    switch (category) {
        case 'Food': return '🍔';
        case 'Transport': return '🚗';
        case 'Entertainment': return '🎬';
        case 'Bills': return '💡';
        case 'Shopping': return '🛍️';
        case 'Health': return '💊';
        default: return '💸';
    }
};

export default ExpenseList;
