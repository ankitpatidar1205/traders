# 🔐 Automatic JWT Token Handling System

## What You Get

A **complete, production-ready system** that automatically handles JWT tokens in your frontend. You'll **never** need to manually write the `Authorization` header again!

```
Login → Token saved → Automatic token in every request → 401? Auto logout
```

---

## 📊 What Was Built

### 6 Core Files

1. **`src/utils/api.js`** (150 lines)
   - Axios instance with interceptors
   - Request: Attach token automatically
   - Response: Handle 401, 403, 404, 500, network errors
   - Helpers: setToken, getToken, clearToken, isAuthenticated

2. **`src/services/authService.js`** (250 lines)
   - `login(email, password)` - Login & save token
   - `logout()` - Logout & clear session
   - `getCurrentUser()` - Get logged-in user
   - `isLoggedIn()` - Check authentication
   - `refreshUserData()` - Refresh from server
   - `updateProfile()` - Update user info
   - `changePassword()` - Change password
   - `verifyToken()` - Verify token validity

3. **`src/hooks/useAuth.js`** (200 lines)
   - React hook for auth management
   - State: user, token, isLoggedIn, isLoading, error
   - Methods: login, logout, refreshUser, updateUser, changePass

4. **`src/components/ProtectedRoute.jsx`** (50 lines)
   - Protect routes from non-authenticated users
   - Optional: Role-based access control
   - Auto-redirect to login if not authenticated

5. **`src/components/examples/LoginExample.jsx`** (150 lines)
   - Complete login form example
   - Shows useAuth hook usage
   - Error handling
   - Auto-redirect on success

6. **`src/components/examples/APICallExample.jsx`** (250 lines)
   - GET, POST, PUT, DELETE examples
   - Shows automatic token attachment
   - Error handling examples
   - Real-world patterns

### 2 Documentation Files

- **`FRONTEND_TOKEN_HANDLING.md`** - Complete setup & reference guide
- **`QUICK_START_TOKEN.md`** - 5-minute quick start

---

## 🚀 Quick Start (5 Minutes)

### 1. Install
```bash
npm install axios
```

### 2. Copy 6 files

Copy these files from documentation into your project:
- `src/utils/api.js`
- `src/services/authService.js`
- `src/hooks/useAuth.js`
- `src/components/ProtectedRoute.jsx`
- `src/components/examples/LoginExample.jsx`
- `src/components/examples/APICallExample.jsx`

### 3. Add .env
```
REACT_APP_API_URL=http://localhost:5000
```

### 4. Use in Your App

```javascript
// Login form
import useAuth from './hooks/useAuth';

function LoginPage() {
    const { login } = useAuth();

    const handleLogin = async (email, password) => {
        await login(email, password);
        // Token saved, user redirected ✅
    };
}

// API calls - token automatic!
import api from './utils/api';

const dashboard = await api.get('/api/dashboard');
const result = await api.post('/api/ai/ai-command', { text: '...' });

// Protected routes
<Route
    path="/dashboard"
    element={<ProtectedRoute component={Dashboard} />}
/>
```

---

## 📚 How It Works

### Request Interceptor
```
User calls: api.get('/api/data')
        ↓
Interceptor checks: Is token in localStorage?
        ↓
YES → Add to header: Authorization: Bearer <token>
NO  → Send request without header
        ↓
Request sent to backend
```

### Response Interceptor
```
Backend responds with 401
        ↓
Interceptor catches it
        ↓
Clear localStorage (token & user)
        ↓
Redirect to /login
        ↓
✅ User logged out, session ended
```

---

## 🎯 Before vs After

### ❌ Before (Manual Token)

```javascript
// Every single API call:
const response = await fetch('/api/dashboard', {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});

// Lots of repetition! 😞
```

### ✅ After (Automatic)

```javascript
// Just import and use:
import api from './utils/api';

const response = await api.get('/api/dashboard');
// Token attached automatically! 🎉
```

---

## 💡 Key Features

### ✅ Automatic Token Attachment
```javascript
// All of these automatically get the token:
api.get('/api/data');
api.post('/api/data', {...});
api.put('/api/data', {...});
api.delete('/api/data');
```

### ✅ Automatic Error Handling
```javascript
// 401? Auto logout & redirect
// 403? Access denied
// 404? Not found
// 500? Server error
// Network error? Connection issue
// All handled! ✅
```

### ✅ useAuth Hook
```javascript
const {
    user,           // { id, username, email, role }
    isLoggedIn,     // Boolean
    isLoading,      // Boolean
    error,          // String
    login,          // Function
    logout,         // Function
    refreshUser,    // Function
    updateUser,     // Function
} = useAuth();
```

### ✅ Protected Routes
```javascript
// Only authenticated users can access:
<Route
    path="/dashboard"
    element={<ProtectedRoute component={Dashboard} />}
/>

// With role-based access:
<Route
    path="/admin"
    element={
        <ProtectedRoute
            component={AdminPanel}
            requiredRoles={['ADMIN', 'SUPERADMIN']}
        />
    }
/>
```

### ✅ Complete Auth Flow
```javascript
// Login
await login(email, password);
// ✅ Token saved to localStorage
// ✅ User data saved
// ✅ Redirected to dashboard

// API calls
api.get('/api/dashboard');
// ✅ Token automatically attached

// Token expires
// ✅ 401 received
// ✅ Token cleared
// ✅ User logged out
// ✅ Redirected to login

// Logout
await logout();
// ✅ Token cleared
// ✅ User cleared
// ✅ Redirected to login
```

---

## 📖 Documentation

### Complete Guide
**→ Read: [FRONTEND_TOKEN_HANDLING.md](FRONTEND_TOKEN_HANDLING.md)**

Includes:
- Installation steps
- Usage examples for every scenario
- API reference
- Error handling guide
- Debugging tips
- Security notes
- Common patterns

### Quick Start
**→ Read: [QUICK_START_TOKEN.md](QUICK_START_TOKEN.md)**

Includes:
- 5-minute setup
- Common tasks
- Before/after examples
- Quick testing guide

---

## 🔧 Files Overview

### Core Files

```javascript
// 1. API Instance (Axios with interceptors)
import api from './utils/api';
await api.get('/api/data');

// 2. Auth Service (Login, logout, refresh, etc)
import { login, logout, getCurrentUser } from './services/authService';
await login(email, password);

// 3. useAuth Hook (For React components)
const { user, login, logout } = useAuth();

// 4. Protected Route (Require authentication)
<ProtectedRoute component={Dashboard} />

// 5. Login Example (Shows how to use)
<LoginExample />

// 6. API Example (Shows API calls)
<APICallExample />
```

### File Structure
```
src/
├── utils/
│   └── api.js ........................... Axios instance
├── services/
│   └── authService.js ................... Auth functions
├── hooks/
│   └── useAuth.js ....................... React hook
└── components/
    ├── ProtectedRoute.jsx .............. Route protection
    └── examples/
        ├── LoginExample.jsx ............. Login form
        └── APICallExample.jsx ........... API calls
```

---

## 🚀 Common Usage

### Login Form

```javascript
import useAuth from './hooks/useAuth';

function LoginPage() {
    const { login, isLoading, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            // Automatically redirected ✅
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
            </button>
            {error && <p className="error">{error}</p>}
        </form>
    );
}
```

### Dashboard (Protected)

```javascript
import useAuth from './hooks/useAuth';
import api from './utils/api';

function Dashboard() {
    const { user, logout } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        // Token automatic! ✅
        api.get('/api/dashboard').then(res => setData(res.data));
    }, []);

    return (
        <div>
            <h1>Welcome {user?.username}!</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

### API Calls

```javascript
import api from './utils/api';

// All automatic! No manual headers!

// GET
const users = await api.get('/api/users');

// POST
const result = await api.post('/api/ai/ai-command', {
    text: 'ID 16 me 5000 add karo'
});

// PUT
const updated = await api.put('/api/profile', {
    full_name: 'New Name'
});

// DELETE
await api.delete('/api/items/123');
```

### Protected Routes

```javascript
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

<Routes>
    {/* Public */}
    <Route path="/login" element={<LoginPage />} />

    {/* Protected */}
    <Route
        path="/dashboard"
        element={<ProtectedRoute component={Dashboard} />}
    />

    {/* Admin only */}
    <Route
        path="/admin"
        element={
            <ProtectedRoute
                component={AdminPanel}
                requiredRoles={['ADMIN', 'SUPERADMIN']}
            />
        }
    />
</Routes>
```

---

## 🔐 Security

✅ **Token in localStorage**
- Automatic cleanup on logout
- Cleared on 401 response
- No persistent login data

✅ **Bearer Token**
- No CSRF vulnerability
- Works with HTTPS

✅ **Automatic Logout**
- On token expiration (401)
- On explicit logout
- On role change

✅ **Protected Routes**
- Redirect to login if not authenticated
- Role-based access control
- No direct URL access

---

## 🧪 Testing

### Test Login
```javascript
// 1. Go to login page
// 2. Enter credentials
// 3. Check localStorage:
localStorage.getItem('token');  // ✅ Has token
localStorage.getItem('user');   // ✅ Has user JSON
```

### Test Token Attachment
```javascript
import api from './utils/api';

// Make API call
await api.get('/api/dashboard');

// Check browser console:
// [API] GET /api/dashboard
// [API] ✅ Token attached to request
```

### Test 401 Handling
```javascript
// Clear token
localStorage.clear();

// Try API call
await api.get('/api/protected');

// Result:
// [API] 🔴 401 Unauthorized
// [API] 🔄 Redirecting to /login
// ✅ Browser redirects to /login
```

---

## ⚙️ Environment Variables

### Development (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Production (.env.production)
```
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## 📝 Checklist

After setup, verify:

- [ ] axios installed: `npm install axios`
- [ ] .env file created with API_URL
- [ ] 6 core files copied into project
- [ ] Login form works
- [ ] Token saved to localStorage after login
- [ ] API calls have Authorization header (check Network tab)
- [ ] Protected routes redirect to login when not authenticated
- [ ] 401 response triggers logout & redirect
- [ ] Token cleared on logout
- [ ] useAuth hook works in components

---

## 🐛 Troubleshooting

### Token Not Attached
```javascript
// Make sure you're using api instance, not fetch
import api from './utils/api';  // ✅
api.get('/api/data');

// NOT:
fetch('/api/data');  // ❌ Won't have token
```

### Still Redirects to Login
```javascript
// Check if token exists
console.log(localStorage.getItem('token'));

// Check user data
console.log(localStorage.getItem('user'));

// Check isLoggedIn
const { isLoggedIn } = useAuth();
console.log(isLoggedIn);
```

### 401 Immediately After Login
```javascript
// Check backend response has token:
// { token: "eyJ...", user: {...} }

// Check token format:
const token = localStorage.getItem('token');
console.log(token);  // Should start with 'eyJ'
```

---

## 📞 Support

### Read More
- Complete guide: [FRONTEND_TOKEN_HANDLING.md](FRONTEND_TOKEN_HANDLING.md)
- Quick start: [QUICK_START_TOKEN.md](QUICK_START_TOKEN.md)

### Check Console
Look for `[API]`, `[Auth]`, `[useAuth]` logs to debug

### Enable Debugging
```javascript
// Add this to see all API calls:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

---

## ✨ Summary

| What | Before | After |
|------|--------|-------|
| **Manual headers** | Every request | ❌ Never |
| **Token management** | Manual cleanup | ✅ Auto |
| **401 handling** | Manual logout | ✅ Auto |
| **Protected routes** | Manual checks | ✅ Built-in |
| **Code reuse** | Copy-paste | ✅ One hook |
| **Setup time** | 30 minutes | ✅ 5 minutes |

---

## 🎉 You're All Set!

Now you can:

✅ Login with automatic token storage
✅ Make API calls without manual headers
✅ Automatic logout on token expiration
✅ Protected routes requiring authentication
✅ Role-based access control
✅ Complete auth flow in production

**Your frontend is now production-ready with automatic token handling! 🚀**

---

## Commit Info

**Commit b7828f0** - Automatic JWT token handling implementation
- 8 files created
- 2200+ lines of code
- Complete with examples and documentation

---

**Questions? Check the documentation files above! 📖**
