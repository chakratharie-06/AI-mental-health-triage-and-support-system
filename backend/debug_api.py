import requests
import json

base_url = "http://localhost:5000"

def test_chat():
    print("1. Anonymous Login...")
    try:
        r = requests.post(f"{base_url}/api/anonymous-login", json={})
        r.raise_for_status()
    except Exception as e:
        print("Login failed:", e, r.text if 'r' in locals() else '')
        return
        
    data = r.json()
    token = data.get("token")
    print("Login successful. Token:", token[:10]+"...")
    
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    print("2. Sending Chat 1...")
    try:
        r = requests.post(f"{base_url}/api/chat", headers=headers, json={"message": "I feel very stressed about my exams!"})
        if r.status_code != 200:
            print("Chat 1 Failed:", r.status_code, r.text)
        else:
            print("Chat 1 Success:", r.json().get('response')[:50]+"...")
            
        print("3. Sending Chat 2...")
        r2 = requests.post(f"{base_url}/api/chat", headers=headers, json={"message": "Now I feel frustrated."})
        if r2.status_code != 200:
            print("Chat 2 Failed:", r2.status_code, r2.text)
        else:
            print("Chat 2 Success:", r2.json().get('response')[:50]+"...")
            
        print("4. Sending Chat 3 (Escalation)...")
        r3 = requests.post(f"{base_url}/api/chat", headers=headers, json={"message": "I'm so sad, life feels overwhelming."})
        if r3.status_code != 200:
            print("Chat 3 Failed:", r3.status_code, r3.text)
        else:
            print("Chat 3 Success:", r3.json().get('response')[:50]+"...")
            
    except Exception as e:
        print("Chat exception:", e)

if __name__ == "__main__":
    test_chat()
