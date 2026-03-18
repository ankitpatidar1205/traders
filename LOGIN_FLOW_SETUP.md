# 🎯 Trader App Login Flow - Complete Setup Guide

## ✅ Status: READY TO USE

Your app login flow is now fully configured and working!

---

## 📱 Login Credentials

**Username:** `trader`
**Password:** `trader123`

---

## 🔄 How the Login Flow Works

### Frontend (Mobile App - tradersapp)

**File:** [`tradersapp/src/screens/auth/LoginScreen.js`](tradersapp/src/screens/auth/LoginScreen.js)

1. User enters username and password in the login form
2. The `handleLogin()` function is triggered
3. App calls `api.login(username, password)` with device info

```javascript
await api.login(username, password, {
    deviceInfo: `${Platform.OS === 'android' ? 'Android' : 'iOS'}...`,
    os: Platform.OS === 'android' ? 'Android' : 'iOS',
    location: 'Mobile App (Virtual)',
    riskScore: Math.floor(Math.random() * 20)
});
```

### API Service (Mobile App)

**File:** [`tradersapp/src/services/api.js`](tradersapp/src/services/api.js)

- Sends POST request to `http://[SERVER_IP]:5000/api/auth/login`
- Server configured in [`tradersapp/src/constants/Config.js`](tradersapp/src/constants/Config.js)

**Current Server IP:** `192.168.1.5:5000`

```javascript
const BASE_URL = `http://192.168.1.5:5000/api`;
```

### Backend (Server - Tradersbackend)

**File:** [`Tradersbackend/src/controllers/authController.js`](Tradersbackend/src/controllers/authController.js)

The login endpoint (`POST /api/auth/login`) does:

1. **Validate Input:** Checks if username and password are provided
2. **Find User:** Queries database for user by username
3. **Verify Password:** Uses bcryptjs to compare hashed password
4. **KYC Check:** For TRADER role, verifies KYC status is `VERIFIED`
5. **Generate JWT Token:** Creates token valid for 24 hours
6. **Track Login:** Records device info, IP, location, and risk score

---

## 🗄️ Database Setup

### User Record

The `trader` user has been created/updated in the `users` table with:

- **Username:** `trader`
- **Password:** `trader123` (bcrypt hashed)
- **Role:** `TRADER`
- **Status:** `Active`
- **Balance:** 100,000
- **Credit Limit:** 50,000

### KYC Status

KYC is set to **`VERIFIED`** so the user can login immediately.

**File:** [`Tradersbackend/traderdb.sql`](Tradersbackend/traderdb.sql)

---

## 🚀 Running the App

### 1. Start the Backend Server

```bash
cd Tradersbackend
npm install  # If not done already
npm start    # Starts on http://localhost:5000
```

**Status:** ✅ Currently running

### 2. Update Mobile App Config (if needed)

If your backend is on a different IP:

**File:** `tradersapp/src/constants/Config.js`

```javascript
const SERVER_IP = '192.168.1.5';  // Change to your backend IP
const PORT = '5000';
```

### 3. Run the Mobile App

```bash
cd tradersapp
npm install  # If not done already
npm start    # Or use Expo/React Native CLI
```

---

## ✨ Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE APP (Frontend)                         │
│                   tradersapp/LoginScreen                         │
├─────────────────────────────────────────────────────────────────┤
│  User enters:                                                    │
│  ├─ Username: trader                                            │
│  └─ Password: trader123                                         │
│                     │                                            │
│                     ▼                                            │
│  handleLogin() function called                                  │
│  └─ Calls api.login(username, password)                         │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ POST request
                         │ Content-Type: application/json
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (Server)                                    │
│           Tradersbackend/authController                          │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/auth/login                                           │
│  ├─ Find user in database by username                           │
│  ├─ Verify password using bcryptjs                             │
│  ├─ Check KYC status (if TRADER role)                          │
│  ├─ Generate JWT token (24h expiry)                            │
│  ├─ Track login (IP, device, location)                         │
│  └─ Return: { token, user: { id, username, role, fullName } }  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ Response with token
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE APP (Frontend)                         │
│               LoginScreen - Post-Login                           │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Token saved in session (api.setSession)                     │
│  ✅ User data stored                                            │
│  ✅ Show "Login successful" popup                               │
│  ✅ Navigate to Main app (home screen)                          │
│  ✅ Future API calls include: Authorization: Bearer {token}     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

1. **Password Hashing:** Passwords hashed with bcryptjs (10 rounds)
2. **JWT Tokens:** Signed with `JWT_SECRET` from `.env`
3. **Token Expiry:** 24-hour expiration for security
4. **KYC Verification:** TRADERs must have verified KYC to login
5. **Login Tracking:** Device info and IP addresses logged
6. **Authorization Headers:** All API calls use Bearer token

---

## 🧪 Testing the Login Flow

### Method 1: Direct cURL Test

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "trader",
    "password": "trader123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 4,
    "username": "trader",
    "role": "TRADER",
    "fullName": "Trader User"
  }
}
```

### Method 2: Mobile App

1. Open the app
2. Enter credentials:
   - Username: `trader`
   - Password: `trader123`
3. Click "LOG IN"
4. You should see the success popup and navigate to the main app

---

## 🐛 Troubleshooting

### "User not found" error
- ✅ User "trader" exists in the database
- Check: `SELECT * FROM users WHERE username = 'trader';`

### "Invalid password" error
- The password has been updated to match `trader123`
- Check: Try the cURL test above to verify backend connectivity

### Backend not responding
- Ensure backend is running: `npm start` in `Tradersbackend/`
- Check port 5000 is accessible

### Mobile app can't connect to backend
- Update `SERVER_IP` in `tradersapp/src/constants/Config.js`
- Current setting: `192.168.1.5`
- Use your machine's local IP address

### KYC verification issue
- The user's KYC status is already set to `VERIFIED`
- If you see "KYC verification incomplete" error:
  - Run: `UPDATE user_documents SET kyc_status = 'VERIFIED' WHERE user_id = 4;`

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| [tradersapp/src/screens/auth/LoginScreen.js](tradersapp/src/screens/auth/LoginScreen.js) | Login UI and form handling |
| [tradersapp/src/services/api.js](tradersapp/src/services/api.js) | API client with login function |
| [tradersapp/src/constants/Config.js](tradersapp/src/constants/Config.js) | Backend server configuration |
| [Tradersbackend/src/controllers/authController.js](Tradersbackend/src/controllers/authController.js) | Login business logic |
| [Tradersbackend/src/routes/authRoutes.js](Tradersbackend/src/routes/authRoutes.js) | Route definitions |
| [Tradersbackend/.env](Tradersbackend/.env) | Environment variables |

---

## 🎓 Understanding the Flow

The login system follows a **client-server authentication pattern**:

1. **Frontend sends credentials** (never stored)
2. **Backend validates** and returns a JWT token
3. **Frontend stores token** in memory (session)
4. **All future requests** include the token in the Authorization header
5. **Backend verifies token** before processing requests

This is a secure, stateless authentication system perfect for mobile apps.

---

## ✅ Next Steps

1. **Start the backend:** `npm start` in `Tradersbackend/`
2. **Run the mobile app:** `npm start` in `tradersapp/`
3. **Login with:** `trader` / `trader123`
4. **Explore the app!**

Happy trading! 🚀
