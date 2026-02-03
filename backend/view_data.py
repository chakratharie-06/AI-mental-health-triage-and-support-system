from app import app, db, User, Conversation, MoodEntry

def view_data():
    with app.app_context():
        print("\n" + "=" * 50)
        print("   CARE NEST DATABASE INSPECTOR")
        print("=" * 50)
        
        print("\n[ USERS ]")
        users = User.query.all()
        if not users:
            print("No users found.")
        for u in users:
            print(f"ID: {u.id} | Name: {u.name} | Age: {u.age_group} | Email: {u.email}")

        print("\n[ MOOD ENTRIES ]")
        moods = MoodEntry.query.all()
        if not moods:
            print("No mood entries found.")
        for m in moods:
            print(f"User {m.user_id}: {m.mood.upper()} (Level: {m.intensity}) - {m.note}")
        
        print("\n[ CONVERSATIONS ]")
        conversations = Conversation.query.all()
        if not conversations:
            print("No conversations found.")
        for c in conversations:
            msgs = c.get_messages()
            print(f"User {c.user_id}: {len(msgs)} messages stored. Last updated: {c.updated_at}")
            
        print("\n" + "=" * 50 + "\n")

if __name__ == "__main__":
    view_data()
