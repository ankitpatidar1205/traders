# 🔐 Automatic Token Handling - Frontend Setup Guide

## Overview

This setup ensures **automatic token management** in your frontend. You'll never need to manually write the `Authorization` header again!

```
User Login
    ↓
Token saved to localStorage
    ↓
Every API request automatically gets the token
    ↓
401 error? Auto logout & redirect
    ↓
No manual header needed! 🎉
```

---

## Files Created

### 1. **`src/utils/api.js`** - Axios Instance
- Creates axios instance with interceptors
- Request interceptor: Automatically attaches token
- Response interceptor: Handles 401, 403, 404, 500 errors
- Helper functions: setToken, getToken, clearToken, isAuthenticated

### 2. **`src/services/authService.js`** - Authentication Functions
- `login(email, password)` - Login user
- `logout()` - Logout user
- `getCurrentUser()` - Get logged-in user
- `isLoggedIn()` - Check if authenticated
- `refreshUserData()` - Refresh user info
- `updateProfile(updates)` - Update profile
- `changePassword(old, new)` - Change password

### 3. **`src/hooks/useAuth.js`** - React Hook
- Custom hook for auth management
- Returns user, token, isLoggedIn, isLoading, error
- Methods: login, logout, refreshUser, updateUser, changePass

### 4. **`src/components/examples/LoginExample.jsx`** - Login Form
- Shows how to use useAuth hook
- Stores token automatically
- Redirects to dashboard on success

### 5. **`src/components/examples/APICallExample.jsx`** - API Requests
- GET, POST, PUT, DELETE examples
- Shows automatic token attachment
- Error handling examples

### 6. **`src/components/ProtectedRoute.jsx`** - Route Protection
- Ensures only authenticated users access routes
- Optional role-based access control

---

## How It Works

### Step 1: User Logs In

```javascript
import useAuth from './hooks/useAuth';

const { login } = useAuth();

// Call login function
const { token, user } = await login('admin@example.com', 'password');
// Token automatically saved to localStorage ✅
```

### Step 2: Token Stored Automatically

```javascript
// In api.js - Request Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;  // ✅ Auto attached!
    }
    return config;
});
```

### Step 3: Every API Call Includes Token

```javascript
import api from './utils/api';

// ✅ Token automatically added!
const response = await api.get('/api/dashboard');

// Equivalent to:
// const response = await fetch('/api/dashboard', {
//     headers: { Authorization: 'Bearer eyJ...' }
// });
```

### Step 4: Handle Token Expiration

```javascript
// In api.js - Response Interceptor
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // ✅ Auto logout & redirect
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

---

## Installation

### Prerequisites
```bash
npm install axios react-router-dom
```

### Setup Steps

1. **Create directory structure:**
```
src/
├── utils/
│   └── api.js
├── services/
│   └── authService.js
├── hooks/
│   └── useAuth.js
├── components/
│   ├── ProtectedRoute.jsx
│   └── examples/
│       ├── LoginExample.jsx
│       └── APICallExample.jsx
```

2. **Copy the files** from above

3. **Set environment variable** (.env):
```
REACT_APP_API_URL=http://localhost:5000
```

---

## Usage Examples

### Example 1: Login Form

```javascript
import useAuth from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const { login, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            // Token saved automatically ✅
            navigate('/dashboard');  // Redirect
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p className="error">{error}</p>}
        </form>
    );
}
```

### Example 2: API Call WITHOUT Token Header

```javascript
import api from './utils/api';

async function getDashboard() {
    try {
        // ✅ NO manual Authorization header needed!
        const response = await api.get('/api/dashboard');
        console.log(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        // 401? Auto logout happens here
    }
}
```

### Example 3: Use in Component

```javascript
import useAuth from './hooks/useAuth';
import api from './utils/api';

function Dashboard() {
    const { user, logout } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        // Fetch with automatic token ✅
        api.get('/api/dashboard').then(res => setData(res.data));
    }, []);

    return (
        <div>
            <h1>Welcome {user?.username}!</h1>
            <button onClick={logout}>Logout</button>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
```

### Example 4: Protected Routes

```javascript
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected - require login */}
            <Route
                path="/dashboard"
                element={<ProtectedRoute component={Dashboard} />}
            />

            {/* Protected - require admin role */}
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
    );
}
```

### Example 5: AI Command

```javascript
import api from './utils/api';

async function executeVoiceCommand(text) {
    try {
        // ✅ Token automatic!
        const response = await api.post('/api/ai/ai-command', { text });
        console.log('✅ Command executed:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Usage:
// await executeVoiceCommand('ID 16 me 5000 add karo');
```

---

## API Methods Reference

### GET Request

```javascript
import api from './utils/api';

// ✅ Token automatic
const response = await api.get('/api/auth/me');
console.log(response.data);
```

### POST Request

```javascript
// ✅ Token automatic
const response = await api.post('/api/ai/ai-command', {
    text: 'ID 16 me 5000 add karo'
});
```

### PUT Request

```javascript
// ✅ Token automatic
const response = await api.put('/api/auth/profile', {
    full_name: 'New Name'
});
```

### DELETE Request

```javascript
// ✅ Token automatic
const response = await api.delete('/api/items/123');
```

### Custom Headers

```javascript
// If you need custom headers (rare):
const response = await api.get('/api/data', {
    headers: {
        'X-Custom-Header': 'value'
        // Authorization header already added by interceptor!
    }
});
```

---

## Error Handling

### 401 Unauthorized (Token Expired)

```javascript
try {
    const response = await api.get('/api/protected');
} catch (error) {
    if (error.status === 401) {
        // ✅ Automatically handled by interceptor!
        // User logged out & redirected to /login
    }
}
```

### 403 Forbidden (Access Denied)

```javascript
try {
    const response = await api.get('/api/admin');
} catch (error) {
    if (error.isForbidden) {
        console.error('Access denied');
    }
}
```

### 404 Not Found

```javascript
try {
    const response = await api.get('/api/nonexistent');
} catch (error) {
    if (error.isNotFound) {
        console.error('Resource not found');
    }
}
```

### Network Error

```javascript
try {
    const response = await api.get('/api/data');
} catch (error) {
    if (error.isNetworkError) {
        console.error('Check your internet connection');
    }
}
```

---

## useAuth Hook - Complete Reference

### Properties

```javascript
const {
    user,          // Current user object { id, username, email, role }
    token,         // JWT token string
    isLoggedIn,    // Boolean
    isLoading,     // Boolean (during login/logout)
    error,         // Error message string
    userId,        // user.id shortcut
    username,      // user.username shortcut
    userRole       // user.role shortcut
} = useAuth();
```

### Methods

```javascript
const {
    login,         // async (email, password) → { token, user }
    logout,        // async () → void
    refreshUser,   // async () → user object
    updateUser,    // async (updates) → user object
    changePass,    // async (old, new) → result
    clearError     // () → void
} = useAuth();
```

---

## Common Patterns

### Pattern 1: Login and Redirect

```javascript
const handleLogin = async (email, password) => {
    try {
        const { user } = await login(email, password);
        navigate('/dashboard');
    } catch (err) {
        setError(err.message);
    }
};
```

### Pattern 2: Fetch Data in useEffect

```javascript
useEffect(() => {
    api.get('/api/data')
        .then(res => setData(res.data))
        .catch(err => setError(err.message));
}, []);
```

### Pattern 3: Update and Refresh

```javascript
const handleUpdate = async (updates) => {
    try {
        await updateUser(updates);
        await refreshUser();  // Get latest data
    } catch (err) {
        setError(err.message);
    }
};
```

### Pattern 4: Check Authentication on Mount

```javascript
useEffect(() => {
    if (!isLoggedIn) {
        navigate('/login');
    }
}, [isLoggedIn, navigate]);
```

---

## Environment Variables

### .env file

```
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Optional: API timeout (milliseconds)
REACT_APP_API_TIMEOUT=10000
```

### .env.production

```
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## Debugging

### Enable Logging

The code includes console.log statements prefixed with `[API]`, `[Auth]`, `[useAuth]`.

Check browser console to see:
```
[API] GET /api/dashboard
[API] ✅ Token attached to request
[API] ✅ 200 GET /api/dashboard
[useAuth] ✅ User already logged in: admin
```

### Debug Token

```javascript
// Check if token exists
console.log(localStorage.getItem('token'));

// Check user data
console.log(JSON.parse(localStorage.getItem('user')));

// Check if authenticated
console.log(useAuth().isLoggedIn);
```

### Test Expired Token

```javascript
// Manually clear token to test 401 handling:
localStorage.removeItem('token');

// Try to fetch protected endpoint
api.get('/api/dashboard');  // Should redirect to /login
```

---

## Backend Requirements

Your Express backend should have:

1. **Login endpoint**
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

2. **JWT middleware**
```javascript
// Checks Authorization header: Bearer <token>
app.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    // Verify token...
});
```

3. **Protected routes**
```javascript
// These should return 401 if token is missing/invalid
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Protected data' });
});
```

---

## Troubleshooting

### Token Not Attached

**Problem:** API calls don't include Authorization header

**Solution:**
```javascript
// Check if token exists
console.log(localStorage.getItem('token'));

// Make sure using `api` instance, not `fetch`
import api from './utils/api';  // ✅
// NOT: fetch('/api/...')  // ❌
```

### 401 Immediately After Login

**Problem:** Token doesn't work

**Solution:**
```javascript
// Check token format in localStorage
const token = localStorage.getItem('token');
console.log(token);  // Should start with 'eyJ'

// Verify backend returns token in response:
// { token: "eyJ...", user: {...} }
```

### Still Redirect to Login

**Problem:** Protected route redirects to login

**Solution:**
```javascript
// Check if user data is saved
console.log(localStorage.getItem('user'));  // Should have JSON

// Check isLoggedIn
const { isLoggedIn } = useAuth();
console.log(isLoggedIn);  // Should be true
```

---

## Security Notes

✅ **Token stored in localStorage**
- Vulnerable to XSS attacks
- Use httpOnly cookies for better security (requires backend changes)

✅ **Token sent in Authorization header**
- HTTPS only in production
- Protects against CSRF

✅ **Automatic logout on 401**
- Prevents using expired tokens
- User redirected to login

✅ **No token in URL**
- Prevents logging

---

## Summary

| What | How | Where |
|------|-----|-------|
| **Store token** | `login()` function | authService.js |
| **Attach to requests** | Request interceptor | api.js |
| **Handle 401** | Response interceptor | api.js |
| **Use in components** | `useAuth()` hook | hooks/useAuth.js |
| **Protect routes** | `<ProtectedRoute>` | ProtectedRoute.jsx |

---

## Never Need to Write This Again

```javascript
// ❌ OLD (Manual header)
const response = await fetch('/api/data', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});

// ✅ NEW (Automatic)
const response = await api.get('/api/data');
// Token attached automatically! 🎉
```

---

**Happy coding! Your frontend is now production-ready with automatic token handling! 🚀**
