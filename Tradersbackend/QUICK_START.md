# Quick Start - AI Command System

## 30-Second Setup

### 1. Start Server
```bash
cd Tradersbackend
npm start
# Server on http://localhost:5000
```

### 2. Get JWT Token
- POST `http://localhost:5000/api/auth/login`
- Body: `{ "email": "admin@example.com", "password": "password" }`
- Copy the `token` from response

### 3. Import Postman Collection
- Open Postman → Import → Select `AI_Command_Postman_Collection.json`
- Set `baseUrl` = `http://localhost:5000`
- Set `token` = your JWT token from step 2

### 4. Test It
- Run "ADD_FUND - Basic" request
- See the magic happen! ✨

---

## The One Endpoint You Need

```
POST /api/ai/ai-command
Header: Authorization: Bearer <token>
Body: { "text": "ID 16 me 5000 add karo" }
```

That's it. Everything else is built in.

---

## 5 Examples

| Goal | Command |
|------|---------|
| Add ₹5000 to user 16 | "ID 16 me 5000 add karo" |
| Block user 10 | "user 10 block karo" |
| Unblock user 12 | "ID 12 ko unblock karo" |
| Create admin Rahul | "new admin banao naam Rahul email rahul@gmail.com" |
| Transfer ₹500 from 10→20 | "ID 10 se ID 20 me 500 transfer karo" |

---

## Architecture (1 Minute Read)

```
Input Text
    ↓
[aiService.js] → Parse with AI/Regex
    ↓
[aiController.js] → Validate fields
    ↓
[dbService.js] → Execute transaction
    ↓
JSON Response
```

**Files:**
- `src/services/aiService.js` — Parsing (OpenAI + rule-based)
- `src/services/dbService.js` — Database operations (transactions)
- `src/controllers/aiController.js` — Main handler
- `src/routes/aiRoutes.js` — Route registration

---

## What It Does

1. **Parses natural language** (Hindi/Hinglish/English)
2. **Extracts action & fields** (user ID, amount, etc.)
3. **Validates all required fields**
4. **Executes database operation** (with transaction safety)
5. **Returns success/error** (with clear messages)

---

## Supported Actions

- ✅ `ADD_FUND` — Add money to user balance
- ✅ `BLOCK_USER` — Suspend a user
- ✅ `UNBLOCK_USER` — Reactivate a user
- ✅ `CREATE_ADMIN` — Create new admin account
- ✅ `TRANSFER_FUND` — Transfer money between users

---

## Security ✓

- ✅ JWT authentication required
- ✅ No SQL injection (parameterized queries)
- ✅ All amounts validated
- ✅ Database transactions (all-or-nothing)
- ✅ Row-level locking (prevents race conditions)

---

## If Something Goes Wrong

**Check the logs:**
```bash
# Terminal shows what happened:
[ai-command] 📝 User Input: ID 16 me 5000 add karo
[ai-command] ✅ Parsed: { action: 'ADD_FUND', userId: 16, amount: 5000 }
[ai-command] ✅ Validation passed
[ADD_FUND] Fetching user 16
[ADD_FUND] Updating balance: 2000 → 7000
[executeAction] ✅ Transaction committed
```

**Common fixes:**
1. Check user exists: `SELECT id FROM users WHERE id = 16;`
2. Check balance: `SELECT balance FROM users WHERE id = 16;`
3. Use clearer language: "ID 16 me 5000 add karo" not "add money"
4. Valid emails only: "rahul@gmail.com" not "rahul"

---

## More Info

📖 Full guide: See `AI_COMMAND_GUIDE.md`
🚀 Postman collection: See `AI_Command_Postman_Collection.json`
💻 Code: See `src/services/` and `src/controllers/aiController.js`

---

**You're all set! Start commanding.** 🎉
