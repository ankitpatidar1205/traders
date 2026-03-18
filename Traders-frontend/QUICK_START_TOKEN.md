# ⚡ Quick Start - Automatic Token Handling (5 Minutes)

## What You Get

✅ Automatic token storage after login
✅ Automatic token attachment to every API request
✅ Automatic logout on token expiration (401)
✅ Protected routes requiring authentication
✅ No manual Authorization header needed

---

## Setup (2 Minutes)

### 1. Install dependency
```bash
npm install axios
```

### 2. Copy 6 files

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

---

## Usage (3 Minutes)

### Login Form

```javascript
import useAuth from './hooks/useAuth';

function LoginPage() {
    const { login, isLoading, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
        // ✅ Token saved! Redirected to dashboard
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="email" type="email" />
            <input name="password" type="password" />
            <button>{isLoading ? 'Loading...' : 'Login'}</button>
            {error && <p>{error}</p>}
        </form>
    );
}
```

### Make API Calls (Automatic Token!)

```javascript
import api from './utils/api';

// ✅ Token automatically attached!
const response = await api.get('/api/dashboard');
console.log(response.data);

// Works with POST, PUT, DELETE too
await api.post('/api/ai/ai-command', { text: '...' });
```

### Protected Routes

```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Routes>
    <Route path="/login" element={<LoginPage />} />
    {/* Only logged-in users can access */}
    <Route
        path="/dashboard"
        element={<ProtectedRoute component={Dashboard} />}
    />
</Routes>
```

---

## Before vs After

### ❌ Before (Manual Token)

```javascript
// Every single request needs this:
const response = await fetch('/api/data', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});
```

### ✅ After (Automatic Token)

```javascript
// Just use api instance:
const response = await api.get('/api/data');
// That's it! Token attached automatically! 🎉
```

---

## Features

### Automatic Request Interceptor
```javascript
// Login once:
await login(email, password);

// Token automatically attached to ALL requests:
api.get('/api/dashboard');     // ✅ Has token
api.post('/api/data', {...});  // ✅ Has token
api.put('/api/user', {...});   // ✅ Has token
api.delete('/api/item/1');     // ✅ Has token
```

### Automatic Response Handler
```javascript
// 401 error (token expired)?
api.get('/api/protected')
    .catch(err => {
        // ✅ Auto logout!
        // ✅ Redirect to /login!
    });

// 403 (access denied)?
// 404 (not found)?
// 500 (server error)?
// Network error?
// All handled automatically!
```

### useAuth Hook

```javascript
const {
    user,      // { id, username, email, role }
    isLoggedIn,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    updateUser
} = useAuth();
```

---

## Common Tasks

### Login User
```javascript
const { login } = useAuth();
await login('admin@example.com', 'password');
```

### Get User Info
```javascript
const { user, username, userRole } = useAuth();
console.log(user.username);  // admin
console.log(userRole);        // ADMIN
```

### Call Protected API
```javascript
// Token automatically sent:
const dashboard = await api.get('/api/dashboard');
const users = await api.get('/api/users');
```

### Logout
```javascript
const { logout } = useAuth();
await logout();  // Clears token, redirects to /login
```

### Update Profile
```javascript
const { updateUser } = useAuth();
const updated = await updateUser({ full_name: 'New Name' });
```

### Refresh Data
```javascript
const { refreshUser } = useAuth();
const latest = await refreshUser();  // Get fresh user data
```

---

## Files Overview

```
utils/api.js
├─ Creates axios instance
├─ Request interceptor: attaches token
└─ Response interceptor: handles errors

services/authService.js
├─ login(email, password)
├─ logout()
├─ getCurrentUser()
├─ refreshUserData()
├─ updateProfile()
└─ changePassword()

hooks/useAuth.js
├─ useState: user, token, isLoggedIn, isLoading, error
├─ useEffect: initialize (check if already logged in)
└─ useCallback: login, logout, refreshUser, updateUser, changePass

components/ProtectedRoute.jsx
├─ Requires authentication to access
└─ Optional: role-based access control

examples/LoginExample.jsx
└─ Shows how to use useAuth hook

examples/APICallExample.jsx
└─ Shows how to use api instance
```

---

## Testing

### Test Login

1. Go to login page
2. Enter email & password
3. Check localStorage:
   ```javascript
   localStorage.getItem('token')  // Should have token
   localStorage.getItem('user')   // Should have user JSON
   ```

### Test Token Attachment

```javascript
import api from './utils/api';

// Make any API call
await api.get('/api/any-protected-route');

// Check browser console:
// [API] GET /api/any-protected-route
// [API] ✅ Token attached to request
// [API] ✅ 200 GET /api/any-protected-route
```

### Test 401 Handling

```javascript
// Clear token to simulate expiration
localStorage.clear();

// Try to make API call
await api.get('/api/protected');

// Should see:
// [API] 🔴 401 Unauthorized
// [API] 🔄 Redirecting to /login
// Browser redirects to /login ✅
```

---

## .env Setup

```bash
# Create .env file in project root
REACT_APP_API_URL=http://localhost:5000

# For production
# REACT_APP_API_URL=https://api.yourdomain.com
```

---

## That's It! 🎉

Now you have:
✅ Automatic token handling
✅ No manual headers needed
✅ Automatic logout on 401
✅ Protected routes
✅ Production-ready code

---

## Next Steps

1. Copy the 6 files into your project
2. Add .env variable
3. Use `useAuth()` in components
4. Use `api` instance for API calls
5. Use `ProtectedRoute` for protected pages

**Never write `Authorization: Bearer` again!** 🚀
