# Soul Sync - OpenAI GPT Integration Guide

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### 2. Add API Key to Environment

**Windows (PowerShell)**:
```powershell
# Temporary (current session only)
$env:OPENAI_API_KEY="sk-your-key-here"

# Permanent (add to your profile)
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-your-key-here', 'User')
```

**Or create a `.env` file** in the `backend` folder:
```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Restart Backend

```powershell
cd backend
venv\Scripts\python app.py
```

You should see: **✅ OpenAI GPT enabled**

---

## How It Works

### With GPT (API Key Present)
- Uses GPT-4o-mini for intelligent, contextual responses
- Remembers last 10 messages for context
- Adapts tone based on severity (RED/YELLOW/GREEN)
- Cultural awareness from system prompt
- More natural, conversational responses

### Without GPT (No API Key)
- Falls back to keyword-based responses
- Still functional and safe
- Uses predefined responses based on triage level
- You'll see: **⚠️ No OPENAI_API_KEY found - using fallback responses**

---

## Testing GPT Integration

### Test 1: Normal Conversation
**You**: "I'm feeling stressed about my exams"  
**Expected (GPT)**: Natural, empathetic response with follow-up questions  
**Expected (Fallback)**: Predefined supportive message

### Test 2: Crisis Detection
**You**: "I want to end it all 😭"  
**Expected (GPT)**: Urgent, empathetic response + specific helpline numbers  
**Expected (Fallback)**: Same crisis response (both modes handle this)

### Test 3: Cultural Context
**You**: "My parents are forcing me into arranged marriage, log kya kahenge"  
**Expected (GPT)**: Culturally aware response acknowledging Indian family dynamics  
**Expected (Fallback)**: Generic distress response

---

## Cost Considerations

- **Model**: GPT-4o-mini (recommended)
  - Cost: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
  - Very affordable for personal use
  
- **Alternative**: GPT-3.5-turbo (cheaper)
  - Change line in code: `model="gpt-3.5-turbo"`
  - Cost: ~$0.50 per 1M tokens
  - Slightly less capable but still good

**Estimated cost**: ~$0.01-0.05 per day for moderate use

---

## Troubleshooting

### "OpenAI package not installed"
```powershell
cd backend
venv\Scripts\pip install openai
```

### "Invalid API key"
- Check key starts with `sk-`
- Verify no extra spaces
- Make sure you copied the full key

### "Rate limit exceeded"
- You've hit OpenAI's free tier limit
- Add payment method to OpenAI account
- Or wait for limit to reset

### GPT responses are too long
Change `max_tokens` in code (line ~313):
```python
max_tokens=100,  # Shorter responses
```

---

## System Prompt Customization

Edit the `SYSTEM_PROMPT` in `app.py` (lines 39-50) to change Soul Sync's personality:

```python
SYSTEM_PROMPT = """
You are Soul Sync, a warm, empathetic mental health companion for Indians.
Your personality:
- [Add your customizations here]
- Use Hinglish when appropriate
- Be culturally sensitive
"""
```

---

## Monitoring Usage

Check your OpenAI usage at:
[https://platform.openai.com/usage](https://platform.openai.com/usage)

---

## Security Notes

- **Never commit** `.env` file to git
- **Never share** your API key
- **Rotate key** if accidentally exposed
- Set **usage limits** in OpenAI dashboard to prevent unexpected charges
