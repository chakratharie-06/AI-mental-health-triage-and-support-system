import React, { useState } from 'react';

const ExpenseForm = ({ onAddExpense }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) return;
        onAddExpense({ ...formData, amount: parseFloat(formData.amount) });
        setFormData({
            title: '',
            amount: '',
            category: 'Food',
            date: new Date().toISOString().split('T')[0]
        });
    };

    return (
        <div className="glass-panel fade-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Add New Expense</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Title</label>
                    <input
                        type="text"
                        className="input-field"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Grocery Shopping"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Amount</label>
                    <input
                        type="number"
                        className="input-field"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Category</label>
                    <select
                        className="input-field"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option>Food</option>
                        <option>Transport</option>
                        <option>Entertainment</option>
                        <option>Bills</option>
                        <option>Shopping</option>
                        <option>Health</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Date</label>
                    <input
                        type="date"
                        className="input-field"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Add Transaction
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;
