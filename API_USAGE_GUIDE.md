# 🚀 Automated JWT Token Handling System

## Overview

Your frontend now has a **fully automated JWT token handling system**. The token is automatically attached to EVERY request via Axios interceptors.

**No more manual Authorization headers!**

---

## How It Works

### 1️⃣ Request Flow

```
User Action
    ↓
Component calls API function
    ↓
API function uses axios (from utils/api.js)
    ↓
Request Interceptor runs:
  - Reads token from localStorage
  - Adds Authorization: Bearer <token> automatically
    ↓
Request sent with token
    ↓
Response received
    ↓
Response Interceptor runs:
  - If 401 → Clears token and redirects to /login
  - If 403 → Returns forbidden error
  - Otherwise → Returns data
    ↓
Component receives data
```

---

## Usage Examples

### ✅ Login (Token is saved automatically)

```javascript
import { login } from '../services/api';

// In your component:
const response = await login('user@example.com', 'password123');
// Token is automatically saved to localStorage with key 'token'
// All future requests will use this token
```

### ✅ Any API Call (Token attached automatically)

```javascript
import { getTrades, updateUser, createFund } from '../services/api';

// No need to add Authorization header manually!
const trades = await getTrades();
const updatedUser = await updateUser(userId, { name: 'New Name' });
const fund = await createFund({ amount: 50000 });
// Token is automatically attached to all these requests
```

### ✅ Voice/AI Commands (Token attached automatically)

```javascript
import { parseVoiceCommand, executeCommand } from '../services/api';

// Previously: Had to manually add Authorization header
// Now: Token is attached automatically!
const parsed = await parseVoiceCommand('add fund 50000');
const result = await executeCommand({ action: 'ADD_FUND', userId: 16, amount: 78900 });
```

### ✅ File Uploads (Token attached automatically)

```javascript
import { updateDocuments, uploadLogo } from '../services/api';

// FormData automatically handled with token
const formData = new FormData();
formData.append('file', fileInput.files[0]);
await updateDocuments(userId, formData);

// Token is attached even with multipart/form-data
```

---

## Key Features

### 🔐 Automatic Token Management

| Feature | Status |
|---------|--------|
| Token read from localStorage | ✅ Automatic |
| Token attached to headers | ✅ Automatic |
| Token updated on login | ✅ Automatic |
| Token cleared on logout | ✅ Automatic |
| Token cleared on 401 | ✅ Automatic |
| Redirect to /login on 401 | ✅ Automatic |

### 🛡️ Error Handling

| Error | Action |
|-------|--------|
| 401 Unauthorized | Token cleared, redirect to /login |
| 403 Forbidden | Return error message, no redirect |
| 404 Not Found | Return error message |
| 5xx Server Error | Return error message with retry hint |
| Network Error | Return error message |

---

## API Endpoints Available

All endpoints in `services/api.js` are ready to use. Examples:

```javascript
// Auth
login(username, password)
changePassword(newPassword)

// Users
getClients(params)
getClientById(id)
createClient(data)
updateUser(id, data)

// Trades
getTrades(filters)
createTrade(data)
closeTrade(id, data)
deleteTrade(id)

// Funds
getTraderFunds(filters)
createFund(data)

// Voice/AI
parseVoiceCommand(text)
executeCommand(commandData)
submitVoiceRecording(audioBlob, meta)

// And many more...
```

---

## Configuration

### Base URL
- Local Dev: `http://localhost:5000/api`
- Production: Set via `REACT_APP_API_URL` environment variable

### Token Storage
- Key: `token`
- Location: `localStorage`
- Auto-saved on login via `setToken(token)`

### Timeout
- Default: 10 seconds
- Configurable in `utils/api.js` (line 28)

---

## Interceptors

### Request Interceptor (`utils/api.js` line 39)

```javascript
// Runs BEFORE every request
- Reads token from localStorage
- Adds Authorization header if token exists
- Logs request details for debugging
```

### Response Interceptor (`utils/api.js` line 70)

```javascript
// Runs AFTER every response
- Handles 401 errors (clears token, redirects to login)
- Handles 403 errors (permission denied)
- Handles 404 errors (not found)
- Handles 5xx errors (server errors)
- Handles network errors
- Logs response details for debugging
```

---

## Migration Guide

### ❌ OLD WAY (Manual Headers)

```javascript
const res = await fetch(`${BASE_URL}/api/ai/execute-command`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // ❌ Manual!
    },
    body: JSON.stringify(commandData)
});
```

### ✅ NEW WAY (Automatic Token)

```javascript
import { executeCommand } from '../services/api';

const result = await executeCommand(commandData);  // ✅ Token automatic!
```

---

## Debugging

The system logs all API activity. Check browser console:

```
[API] Initializing with base URL: http://localhost:5000/api
[API] POST /auth/login { hasToken: false, ... }
[API] ✅ Token attached to request
[API] ✅ 200 POST /auth/login
[API] Token saved to localStorage
[API] POST /ai/execute-command { hasToken: true, ... }
[API] ✅ Token attached to request
[API] ✅ 200 POST /ai/execute-command
```

---

## Token Flow Diagram

```
LOGIN
  │
  ├─ POST /auth/login (no token needed)
  │
  └─ Response: { token: "eyJ...", user: {...} }
       │
       └─ localStorage['token'] = token
            │
            └─ All future requests use this token

AUTHENTICATED REQUESTS
  │
  ├─ GET /users
  │  Interceptor: Add "Authorization: Bearer eyJ..."
  │
  ├─ POST /ai/execute-command
  │  Interceptor: Add "Authorization: Bearer eyJ..."
  │
  └─ PUT /admin/theme
     Interceptor: Add "Authorization: Bearer eyJ..."

TOKEN EXPIRATION
  │
  ├─ Response: 401 Unauthorized
  │
  └─ Response Interceptor:
      ├─ localStorage.removeItem('token')
      └─ window.location.href = '/login'
```

---

## File Structure

```
src/
├── utils/
│   └── api.js                    # ← Axios instance with interceptors
├── services/
│   ├── api.js                    # ← All API functions (uses axios)
│   ├── voiceService.js           # ← Voice API (uses api.js)
│   └── authService.js            # ← Auth functions (uses axios)
└── hooks/
    └── useAuth.js                # ← Auth hook
```

---

## Summary

✅ **Fully automated JWT token handling**
✅ **No manual headers needed**
✅ **Works for all API types** (REST, File upload, Voice)
✅ **Automatic error handling** (401 → logout & redirect)
✅ **Single point of configuration** (utils/api.js)
✅ **Production-ready** (logging, timeout, error handling)

**Start using it immediately. No changes to component code needed!**
