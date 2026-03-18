# AI Command Execution System - Complete Guide

## Overview

The **unified AI Command endpoint** (`POST /api/ai/ai-command`) is a single, intelligent gateway for executing admin operations via natural language text input.

```
User Input (natural language)
        ↓
    Parse AI Command
        ↓
    Validate Fields
        ↓
    Execute DB Operation
        ↓
    Return Result
```

---

## Architecture

### Files

- **`src/services/aiService.js`** — AI parsing (OpenAI + rule-based fallback)
- **`src/services/dbService.js`** — Database operations (transactions + safety)
- **`src/controllers/aiController.js`** — Main endpoint controller
- **`src/routes/aiRoutes.js`** — Route registration

### Supported Actions

| Action | Requires | Example |
|--------|----------|---------|
| `ADD_FUND` | userId, amount | "ID 16 me 5000 add karo" |
| `BLOCK_USER` | userId | "user 10 block karo" |
| `UNBLOCK_USER` | userId | "ID 12 ko unblock karo" |
| `CREATE_ADMIN` | name, email | "new admin banao naam Rahul email rahul@gmail.com" |
| `TRANSFER_FUND` | fromUserId, toUserId, amount | "ID 10 se ID 20 me 500 transfer karo" |

---

## Testing in Postman

### Setup

1. **Start the backend**
   ```bash
   cd Tradersbackend
   npm start
   # Server runs on http://localhost:5000
   ```

2. **Get JWT Token**
   - Login endpoint: `POST /api/auth/login`
   - Body: `{ "email": "admin@example.com", "password": "your_password" }`
   - Copy the `token` from response

3. **Postman Environment Variable**
   - Create env var: `token` = your_jwt_token

---

### Test Cases

#### 1️⃣ ADD_FUND

**Request:**
```
POST http://localhost:5000/api/ai/ai-command
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "text": "ID 16 me 5000 add karo"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "action": "ADD_FUND",
  "message": "Fund added successfully",
  "userId": 16,
  "amountAdded": 5000,
  "newBalance": 7000
}
```

**Variations:**
- `"text": "user 16 add 5000"`
- `"text": "ID 16 deposit 5000"`
- `"text": "जमा करो user ID 16 5000"` (Hindi)
- `"text": "user 16 ko 5k credit karo"` (Hinglish, "k" = 1000)

---

#### 2️⃣ BLOCK_USER

**Request:**
```
POST http://localhost:5000/api/ai/ai-command
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "text": "user 10 block karo"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "action": "BLOCK_USER",
  "message": "User 10 blocked (Suspended) successfully",
  "userId": 10
}
```

**Variations:**
- `"text": "ID 10 suspend karo"`
- `"text": "user 10 band karo"` (Hindi)
- `"text": "block user ID 10"`

---

#### 3️⃣ UNBLOCK_USER

**Request:**
```
POST http://localhost:5000/api/ai/ai-command
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "text": "ID 12 ko unblock karo"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "action": "UNBLOCK_USER",
  "message": "User 12 unblocked (Active) successfully",
  "userId": 12
}
```

**Variations:**
- `"text": "user 12 activate karo"`
- `"text": "ID 12 kholo"` (Hindi)
- `"text": "reactivate user 12"`

---

#### 4️⃣ CREATE_ADMIN

**Request (with details):**
```
POST http://localhost:5000/api/ai/ai-command
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "text": "new admin banao naam Rahul email rahul@gmail.com"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "action": "CREATE_ADMIN",
  "message": "Admin created successfully",
  "adminId": 42,
  "username": "rahul_23456",
  "name": "Rahul",
  "email": "rahul@gmail.com",
  "password": "Admin@1234"
}
```

**Request (with dummy credentials):**
```
{
  "text": "create admin with dummy credentials"
}
```

**Response:**
```json
{
  "success": true,
  "action": "CREATE_ADMIN",
  "message": "Admin created successfully",
  "adminId": 43,
  "username": "smart_admin_78901",
  "name": "smart_admin",
  "email": "smart.admin456@example.com",
  "password": "Pass456@!"
}
```

**Variations:**
- `"text": "admin banao naam John email john@test.com password Secure@123"`
- `"text": "add a admin with random credentials"`
- `"text": "नया admin बनाओ"`

---

#### 5️⃣ TRANSFER_FUND

**Request:**
```
POST http://localhost:5000/api/ai/ai-command
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "text": "ID 10 se ID 20 me 500 transfer karo"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "action": "TRANSFER_FUND",
  "message": "₹500 transferred from user 10 to user 20",
  "fromUserId": 10,
  "toUserId": 20,
  "amount": 500,
  "fromBalance": 4500,
  "toBalance": 10500
}
```

**Variations:**
- `"text": "transfer 500 from ID 10 to ID 20"`
- `"text": "user 10 se user 20 ko 500 bhejo"`
- `"text": "send 500 from user 10 to user 20"`

---

### Error Scenarios

#### ❌ Missing Required Fields

**Request:**
```json
{
  "text": "add 5000"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "ADD_FUND requires userId and amount"
}
```

#### ❌ Command Not Understood

**Request:**
```json
{
  "text": "random gibberish text"
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "message": "Command not understood. Try: \"ID 16 me 5000 add karo\" or \"user 15 block karo\""
}
```

#### ❌ User Not Found

**Request:**
```json
{
  "text": "ID 99999 block karo"
}
```

**Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "User 99999 not found"
}
```

#### ❌ Insufficient Balance

**Request (User 10 has ₹100 balance):**
```json
{
  "text": "ID 10 se ID 20 me 500 transfer karo"
}
```

**Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Insufficient balance. User 10 has ₹100"
}
```

---

## Frontend Integration

### React Example

```javascript
import { useState } from 'react';

const AiCommandPanel = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeCommand = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token'); // from login

      const response = await fetch('/api/ai/ai-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setResult(data);
      setText(''); // clear input
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-command-panel">
      <h2>Admin Command Panel</h2>

      <form onSubmit={executeCommand}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type command: 'ID 16 me 5000 add karo'"
          rows="3"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Execute'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="success">
          <h3>✅ {result.action}</h3>
          <p>{result.message}</p>
          {result.newBalance && <p>New Balance: ₹{result.newBalance}</p>}
          {result.adminId && <p>Admin ID: {result.adminId}, Password: {result.password}</p>}
        </div>
      )}
    </div>
  );
};

export default AiCommandPanel;
```

### Vue Example

```vue
<template>
  <div class="ai-command-panel">
    <h2>Admin Command Panel</h2>

    <form @submit.prevent="executeCommand">
      <textarea
        v-model="text"
        placeholder="Type command: 'ID 16 me 5000 add karo'"
        rows="3"
      />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Processing...' : 'Execute' }}
      </button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="result" class="success">
      <h3>✅ {{ result.action }}</h3>
      <p>{{ result.message }}</p>
      <p v-if="result.newBalance">New Balance: ₹{{ result.newBalance }}</p>
      <p v-if="result.adminId">Admin ID: {{ result.adminId }}, Password: {{ result.password }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: '',
      result: null,
      error: null,
      loading: false,
    };
  },
  methods: {
    async executeCommand() {
      this.loading = true;
      this.error = null;
      this.result = null;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/ai/ai-command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ text: this.text }),
        });

        const data = await response.json();

        if (!response.ok) {
          this.error = data.message;
          return;
        }

        this.result = data;
        this.text = '';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
```

---

## Debugging Errors

### Server Logs

When you send a request, watch the terminal/console output:

```
═══════════════════════════════════════════════════════════════
[ai-command] 📝 User Input: ID 16 me 5000 add karo
═══════════════════════════════════════════════════════════════
[parseCommand] Using rule-based parser (no valid OPENAI_API_KEY)
[ai-command] ✅ Parsed: { action: 'ADD_FUND', userId: 16, amount: 5000 }
[ai-command] ✓ Validating parsed data...
[ai-command] ✅ Validation passed
[ai-command] ▶️  Executing database operation...
[ADD_FUND] Validating userId and amount
[ADD_FUND] Fetching user 16
[ADD_FUND] Updating user 16 balance: 2000 → 7000
[ADD_FUND] Inserting ledger entry for DEPOSIT
[executeAction] ✅ Transaction committed for ADD_FUND
[ai-command] ✅ Execution result: { success: true, message: '...', ... }
[ai-command] 🎉 Command completed successfully
═══════════════════════════════════════════════════════════════
```

### Common Issues

#### 1️⃣ "Command not understood"

**Cause:** Parser couldn't detect intent
**Solution:** Use clearer language with keywords:
- `"add"` instead of `"increase"`
- `"block"` instead of `"disable"`
- Include `ID` or `user` before the number

#### 2️⃣ "userId is required"

**Cause:** Parser didn't extract user ID
**Solution:** Include `ID` or `user` keyword:
- ✅ "ID 16 add 5000"
- ❌ "add 5000 for person"

#### 3️⃣ "User X not found"

**Cause:** User ID doesn't exist in database
**Solution:** Verify user exists first:
```bash
# SSH to DB or use DB client
SELECT id, username FROM users WHERE id = 16;
```

#### 4️⃣ "Insufficient balance"

**Cause:** Transfer amount > user's balance
**Solution:** Check balance first:
```bash
SELECT id, balance FROM users WHERE id = 10;
```

#### 5️⃣ "Email already exists"

**Cause:** Creating admin with duplicate email
**Solution:** Use a unique email:
- ✅ "new admin email unique_admin@example.com"
- ❌ "new admin email existing@company.com"

---

## Security

✅ **All requests require JWT authentication** (`authMiddleware`)
✅ **All queries use parameterized placeholders** (no SQL injection)
✅ **All amounts validated as positive numbers**
✅ **All DB operations use transactions** (all-or-nothing)
✅ **Row-level locking** for TRANSFER_FUND (prevents race conditions)
✅ **Passwords hashed** with bcryptjs (CREATE_ADMIN)

---

## Configuration

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tradersdb

# JWT
JWT_SECRET=your_secret_key

# OpenAI (optional for AI parsing)
OPENAI_API_KEY=sk-...your_key...

# Server
PORT=5000
```

### OpenAI Integration (Optional)

If `OPENAI_API_KEY` is set and valid:
- Uses `gpt-4o-mini` for parsing (better accuracy with Hindi/Hinglish)
- Falls back to rule-based parser if OpenAI fails

If not set or invalid:
- Uses rule-based regex parser (fast, offline, works fine)

---

## Production Checklist

- [ ] All environment variables set correctly
- [ ] JWT_SECRET is strong and unique
- [ ] Database backups configured
- [ ] Rate limiting added (to prevent abuse)
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Admin credentials rotated (if created via AI)
- [ ] Logs monitored for errors

---

## Performance

- **Parse time:** ~10ms (rule-based) or ~500ms (OpenAI)
- **DB time:** ~50ms per operation
- **Total time:** ~100-600ms depending on parser

### Optimization Tips

1. Cache frequently used user IDs
2. Use read replicas for SELECT queries
3. Connection pooling (already configured)
4. Add rate limiting on `/ai-command` endpoint

---

## Support

### Logs Location

- Backend: Console output (stdout)
- DB queries: Available via `SHOW PROCESSLIST;` in MySQL

### Endpoints Summary

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/ai/ai-command` | POST | Yes | **NEW: Main unified endpoint** |
| `/api/ai/ai-parse` | POST | Yes | Parse only (returns JSON) |
| `/api/ai/execute-command` | POST | Yes | Execute pre-parsed command |
| `/api/ai/voice-execute` | POST | Yes | Legacy parse + execute |

---

## Examples by Language

### English
- "Add 5000 to user 16"
- "Block user 10"
- "Create admin with name Rajesh email rajesh@test.com"

### Hindi
- "यूजर 16 को 5000 जमा कर"
- "यूजर 10 को ब्लॉक कर"
- "नया एडमिन बनाओ राजेश"

### Hinglish
- "ID 16 me 5000 add karo"
- "user 10 block karo"
- "new admin banao naam Rajesh email raj@test.com"
- "user 10 se user 20 me 500 transfer karo"
- "ID 12 ko unblock karo"

---

**Happy commanding! 🚀**
