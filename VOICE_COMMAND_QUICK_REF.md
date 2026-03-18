# 🎙️ Voice Command - Quick Reference

## Use in Components (1 Line!)

```javascript
import { useVoiceCommand } from '../hooks/useVoiceCommand';

const { executeCommand, isProcessing, result, error } = useVoiceCommand();
const result = await executeCommand("ID 16 me 5000 add karo");
```

---

## Command Examples

| Command | Module | Operation | Data |
|---------|--------|-----------|------|
| "ID 16 me 5000 add karo" | funds | add | userId: 16, amount: 5000 |
| "ID 16 se 2000 withdraw karo" | funds | withdraw | userId: 16, amount: 2000 |
| "user 20 ko block karo" | user | block | userId: 20 |
| "new admin banao Rahul" | admin | create | name: "Rahul" |
| "user 25 ko delete kr de" | user | delete | userId: 25 |
| "broker ko trader assign karo" | broker | assign | userId: ... |
| "new broker banao Amit" | broker | create | name: "Amit" |
| "trade 100 close karo" | trade | close | tradeId: 100 |

---

## How It Works

```
User Says: "ID 16 me 5000 add karo"
           ↓
    Parser identifies:
    - Operation: "add" (keywords: add, karo, kr de, dalo)
    - Module: "funds" (keywords: fund, paise, money, amount)
    - Data: userId=16, amount=5000
           ↓
    Returns: {
        module: "funds",
        operation: "add",
        data: { userId: 16, amount: 5000 }
    }
           ↓
    Controller executes:
    → api.createFund({ userId: 16, amount: 5000, type: 'ADD' })
           ↓
    Result:
    { success: true, message: "add operation completed!", data: {...} }
```

---

## Supported Keywords

**Operations:**
- add: add, karo, kr de, dalo, lagao, banao, create
- withdraw: hatao, nikalo, withdraw, nikal le, nikal de
- delete: delete, hata de, mitao, remove, uda do
- block: block, band karo, disable, band kr de
- create: create, banao, naya, new
- assign: assign, dedo, allocate, dena
- unblock: unblock, enable, activate, khol de
- update: update, badlo, change, modify

**Modules:**
- funds: fund, paise, money, amount, balance, wallet
- user: user, client, trader, person, member
- admin: admin, administrator
- broker: broker, dalalal
- trade: trade, deal, business

---

## Data Extraction

| Extract | Patterns | Examples |
|---------|----------|----------|
| User ID | ID 16, user 16, 16 ko, ID#16 | "ID 16", "user 20", "25 ko" |
| Amount | 5000, 5,000, ek lakh, paanch hazaar | "5000", "1 lakh", "50 hazaar" |
| Name | Rahul ko, banao Amit, admin Rahul | "new admin banao Rahul" |

---

## Response Format

### ✅ Success
```javascript
{
    success: true,
    message: "add operation completed successfully!",
    data: { /* API response */ },
    command: { module, operation, data }
}
```

### ❌ Error
```javascript
{
    success: false,
    error: "Missing required data",
    message: "Could not understand command"
}
```

---

## Usage Patterns

### Direct Service Call
```javascript
import { processVoiceCommand } from '../services/voiceCommandController';

const result = await processVoiceCommand("ID 16 me 5000 add karo");
```

### React Hook
```javascript
const { executeCommand, result, error, isProcessing } = useVoiceCommand();
const response = await executeCommand("new admin banao Rahul");
```

### Voice Service
```javascript
import { processIntelligentCommand } from '../services/voiceService';

const result = await processIntelligentCommand("user 20 ko block karo");
```

---

## Token Handling ✅

- ✅ Automatically attached to all API calls
- ✅ No manual Authorization header needed
- ✅ 401 errors auto-handled (logout + redirect)
- ✅ Ready for production!

---

## Testing

```javascript
// Test command
const result = await executeCommand("ID 16 me 5000 add karo");

// Check result
if (result.success) {
    console.log('✅ Executed:', result.command);
} else {
    console.log('❌ Error:', result.error);
}
```

---

## Debugging

```javascript
// Enable logs in console
// Browser DevTools → Console
// Look for [CommandParser] and [VoiceController] logs
```

---

## Summary

✅ Intelligent NLP
✅ Dynamic intent mapping
✅ Auto data extraction
✅ Automatic token handling
✅ Production-ready

**That's it! You're good to go!** 🚀
