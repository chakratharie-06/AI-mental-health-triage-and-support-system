from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age_group = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    conversations = db.relationship('Conversation', backref='user', lazy=True, cascade='all, delete-orphan')
    mood_entries = db.relationship('MoodEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    journal_entries = db.relationship('JournalEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    time_logs = db.relationship('TimeLog', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'age_group': self.age_group,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class Conversation(db.Model):
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    messages = db.Column(db.Text, nullable=False)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_messages(self):
        return json.loads(self.messages)
    
    def set_messages(self, messages_list):
        self.messages = json.dumps(messages_list)
    
    def add_message(self, role, text, triage_status='GREEN', distress_level=0):
        messages = self.get_messages()
        messages.append({
            'role': role,
            'text': text,
            'triage_status': triage_status,
            'distress_level': distress_level,
            'timestamp': datetime.utcnow().isoformat()
        })
        self.set_messages(messages)
        self.updated_at = datetime.utcnow()

class MoodEntry(db.Model):
    __tablename__ = 'mood_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    mood = db.Column(db.String(50), nullable=False)  # happy, sad, anxious, stressed, calm
    intensity = db.Column(db.Integer, default=5)  # 1-10 scale
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'mood': self.mood,
            'intensity': self.intensity,
            'note': self.note,
            'created_at': self.created_at.isoformat()
        }

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)
    mood_tag = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'mood_tag': self.mood_tag,
            'created_at': self.created_at.isoformat()
        }

class TimeLog(db.Model):
    __tablename__ = 'time_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    minutes = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'minutes': self.minutes,
            'created_at': self.created_at.isoformat()
        }
