# 🚀 Automated Token Handling - Quick Reference

## TL;DR

✅ **Token is automatically attached to EVERY API request**
✅ **No manual headers needed**
✅ **Works for all APIs including voice commands**

---

## Usage (Copy-Paste Ready)

### Login
```javascript
import { login } from '../services/api';

const response = await login('user@example.com', 'password123');
// Token saved automatically!
```

### Any API Call - Token is Automatic!
```javascript
import { getTrades, updateUser, executeCommand, createFund } from '../services/api';

// Token attached automatically to all these
const trades = await getTrades({ limit: 10 });
const user = await updateUser(userId, { name: 'New Name' });
const cmd = await executeCommand({ action: 'ADD_FUND', userId: 16, amount: 78900 });
const fund = await createFund({ amount: 50000 });
```

### Voice Command (Previously broken - Now Fixed!)
```javascript
import { parseVoiceCommand, executeCommand } from '../services/api';

// Token is automatically included
const parsed = await parseVoiceCommand('add 50000 fund');
const result = await executeCommand(parsed);
```

### File Upload (Token still automatic!)
```javascript
import { updateDocuments, uploadLogo } from '../services/api';

const formData = new FormData();
formData.append('file', fileInput.files[0]);

// Token is attached even with FormData
await updateDocuments(userId, formData);
```

---

## How It Works (3 Steps)

```
1. API Call
   ↓
2. Request Interceptor
   └─ Reads token from localStorage
   └─ Adds Authorization header
   ↓
3. Request sent to server WITH token
```

---

## Error Handling (Automatic)

| Error | What Happens |
|-------|--------------|
| 401 Unauthorized | Token cleared, redirect to `/login` |
| 403 Forbidden | Show error message |
| 404 Not Found | Show error message |
| 5xx Server Error | Show error message |
| Network Error | Show error message |

---

## Common Scenarios

### ✅ After Login
```javascript
// Token is automatically saved
localStorage.getItem('token') // → "eyJ..."
```

### ✅ Making Requests
```javascript
// Token is automatically added to headers
// Authorization: Bearer eyJ...
// (Invisible to you - happens automatically)
```

### ✅ Token Expires (401)
```javascript
// Request fails with 401
// Interceptor automatically:
// 1. Clears token
// 2. Redirects to /login
// 3. User must login again
```

### ✅ Logout
```javascript
// Token is automatically cleared
localStorage.getItem('token') // → null
```

---

## All Available API Functions

See `src/services/api.js` for complete list, but here are common ones:

```
Auth: login, changePassword
Users: getClients, getClientById, createClient, updateUser
Trades: getTrades, createTrade, closeTrade, deleteTrade
Funds: getTraderFunds, createFund
Requests: getRequests, updateRequestStatus, approveRequest
Notifications: getNotifications, createNotification, deleteNotification
Voice/AI: parseVoiceCommand, executeCommand, submitVoiceRecording
Kite: getKiteStatus, getKiteProfile, getKiteMargins, etc
And 40+ more...
```

---

## Debug Checklist

```javascript
// 1. Is token saved?
localStorage.getItem('token')  // Should have a value

// 2. Is token being sent?
// Open DevTools → Network → Look for "Authorization" header
// Should show: "Bearer eyJ..."

// 3. Are API logs visible?
// Open DevTools Console → Search for "[API]"
// Should see request/response logs

// 4. Test endpoint directly
import { executeCommand } from '../services/api';
executeCommand({ action: 'ADD_FUND', userId: 16, amount: 78900 })
  .then(r => console.log('✅ Success:', r))
  .catch(e => console.error('❌ Error:', e.message))
```

---

## Files Changed

| File | What | Why |
|------|------|-----|
| `utils/api.js` | Fixed base URL | Include `/api` in path |
| `services/api.js` | Use Axios everywhere | Automatic token handling |
| `services/voiceService.js` | Use API service | Voice gets automatic token |
| Token Key | `'token'` | Consistency (was mixed) |

---

## What NOT to Do

❌ `localStorage.setItem('token', ...)` manually
❌ `Authorization` header in fetch/axios
❌ Check token before API calls
❌ Pass token as function parameter
❌ Import different API clients

**Let the system handle it!** ✨

---

## Need a New Endpoint?

Just add to `src/services/api.js`:

```javascript
export const myNewEndpoint = async (params) => {
    const response = await api.post('/my-endpoint', params);
    return response.data;
};
```

✅ Token is automatically handled!

---

## System Status

✅ Token reading: Automatic
✅ Token sending: Automatic
✅ Token saving: Automatic
✅ Token clearing: Automatic
✅ Error handling: Automatic
✅ Timeout: Automatic (10s)
✅ Logging: Automatic

**Everything is automatic!** 🎉

---

**Questions? Check `API_USAGE_GUIDE.md` or `IMPLEMENTATION_SUMMARY.md`**
