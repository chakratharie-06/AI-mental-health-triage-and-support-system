from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Expense
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'expenses.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    expenses = Expense.query.order_by(Expense.date.desc()).all()
    return jsonify([expense.to_dict() for expense in expenses])

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.json
    new_expense = Expense(
        title=data['title'],
        amount=data['amount'],
        category=data['category'],
        date=data['date']
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify(new_expense.to_dict()), 201

@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    expense = Expense.query.get_or_404(id)
    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Expense deleted'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
