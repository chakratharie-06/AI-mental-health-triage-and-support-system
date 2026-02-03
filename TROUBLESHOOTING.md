# Quick Troubleshooting Guide

## Login Page Issues

### Problem: Can't log in or page doesn't load

**Solution 1: Check both servers are running**
```powershell
# Terminal 1 - Backend
cd backend
venv\Scripts\python app.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

**Solution 2: Clear browser cache and localStorage**
1. Open browser DevTools (F12)
2. Go to Application tab → Local Storage
3. Delete all items
4. Refresh page (Ctrl+F5)

**Solution 3: Test backend directly**
Visit: http://127.0.0.1:5000/api/admin/data
- If this shows JSON data → Backend is working
- If error → Backend issue

### Problem: "Invalid credentials" error

**Cause**: User doesn't exist in database yet

**Solution**: Click "Sign Up" first to create an account

### Problem: Form submits but nothing happens

**Check browser console** (F12 → Console tab) for errors:
- CORS error → Backend not running
- Network error → Wrong API URL
- 401 error → Token issue

### Test Login Flow:

1. **Sign Up**:
   - Go to http://localhost:5173/signup
   - Fill: Name, Email, Password
   - Should redirect to chat

2. **Sign In**:
   - Go to http://localhost:5173/signin  
   - Use same email/password from signup
   - Should redirect to chat

3. **View stored users**:
   - http://127.0.0.1:5000/api/admin/data
   - Check "users" array for your account

### Common Errors:

| Error | Cause | Fix |
|-------|-------|-----|
| "Email already registered" | Trying to sign up twice | Use sign in instead |
| "Invalid credentials" | Wrong password or user doesn't exist | Check spelling or sign up first |
| "Token is missing" | Not logged in | Sign in again |
| "Cannot read properties of undefined" | Frontend/backend mismatch | Restart both servers |

### Still not working?

1. Check backend terminal for errors
2. Check frontend terminal for build errors  
3. Open browser console (F12) and share the error message
