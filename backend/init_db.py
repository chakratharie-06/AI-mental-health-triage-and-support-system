import os
from app import app, db

# Delete existing DB if exists to ensure schema update
db_path = os.path.join(os.path.dirname(__file__), 'care_nest.db')
if os.path.exists(db_path):
    os.remove(db_path)
    print("Deleted old database")

with app.app_context():
    db.create_all()
    print("Created new database with updated schema")
