# ⚡ Quick Start - Trader App Login

## 🎯 Your Login Credentials

```
Username: trader
Password: trader123
```

---

## 🚀 Run Backend

```bash
cd Tradersbackend
npm start
```

**Expected Output:**
```
✅ MySQL Connected Successfully
Server listening on port 5000
```

---

## 🚀 Run Mobile App

```bash
cd tradersapp
npm start
```

---

## 📱 Login on App

1. Open the app
2. See login screen with "VTRKM" logo
3. Enter:
   - Username: `trader`
   - Password: `trader123`
4. Click "LOG IN"
5. ✅ You're in!

---

## 🔗 Server Configuration

**Backend URL:** `http://localhost:5000/api`

**Mobile App Config:** `tradersapp/src/constants/Config.js`

If backend is on different IP:
```javascript
const SERVER_IP = 'YOUR.IP.HERE'; // Change to your backend IP
```

---

## ✨ What's Working

✅ User "trader" created in database
✅ Password "trader123" set correctly
✅ KYC verified (can login immediately)
✅ Backend running on port 5000
✅ JWT token generation working
✅ Login tracking enabled

---

## 🧪 Test Backend Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"trader","password":"trader123"}'
```

**Success Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 4,
    "username": "trader",
    "role": "TRADER",
    "fullName": "Test Trader"
  }
}
```

---

## 📚 For More Details

See: [LOGIN_FLOW_SETUP.md](LOGIN_FLOW_SETUP.md)

---

**Status:** ✅ All Systems Ready! You can now login and use the app.
