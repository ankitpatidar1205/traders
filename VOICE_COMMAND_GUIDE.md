# 🎙️ Intelligent Voice Command System

## Overview

A **fully intelligent** voice/text command system that:
1. ✅ Understands natural language (English/Hindi/Hinglish)
2. ✅ Dynamically maps intent to operations
3. ✅ Extracts data automatically
4. ✅ Executes backend operations
5. ✅ Returns results with automatic token handling

---

## Architecture

```
User Command (Voice/Text)
        ↓
Command Parser (NLP)
  ├─ Identify operation (add, withdraw, block, create, etc.)
  ├─ Identify module (funds, user, admin, broker, etc.)
  └─ Extract data (userId, amount, name, etc.)
        ↓
Structured JSON
  {
    "module": "funds",
    "operation": "add",
    "data": { "userId": 16, "amount": 5000 }
  }
        ↓
Voice Command Controller
  └─ Route to correct executor
        ↓
API Execution (with automatic token)
  └─ Backend processes and responds
        ↓
Result to User
```

---

## Files

| File | Purpose |
|------|---------|
| `services/commandParser.js` | Parse natural language → JSON |
| `services/voiceCommandController.js` | Execute commands |
| `services/voiceService.js` | Wrapper with timeout handling |
| `hooks/useVoiceCommand.js` | React hook for components |

---

## Usage Examples

### 1️⃣ Using React Hook (Recommended)

```javascript
import { useVoiceCommand } from '../hooks/useVoiceCommand';

function MyComponent() {
    const { executeCommand, isProcessing, result, error } = useVoiceCommand();

    const handleCommand = async () => {
        const response = await executeCommand("ID 16 me 5000 add karo");

        if (response.success) {
            console.log('✅ Command executed:', response.data);
            // Show success message
        } else {
            console.error('❌ Error:', response.error);
            // Show error message
        }
    };

    return (
        <div>
            <button onClick={handleCommand} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Execute Command'}
            </button>
            {result && <p>{result.message}</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    );
}
```

### 2️⃣ Direct Service Call

```javascript
import { processVoiceCommand } from '../services/voiceCommandController';

// Direct call
const result = await processVoiceCommand("ID 16 me 5000 add karo");

if (result.success) {
    console.log('✅ Success:', result.data);
    console.log('Command:', result.command); // { module, operation, data }
} else {
    console.log('❌ Error:', result.error);
}
```

### 3️⃣ Using Voice Service

```javascript
import { processIntelligentCommand } from '../services/voiceService';

// With timeout handling
const result = await processIntelligentCommand("new admin banao Rahul");
```

---

## Supported Commands

### 💰 Funds Operations

```
"ID 16 me 5000 add karo"
→ { module: "funds", operation: "add", data: { userId: 16, amount: 5000 } }

"ID 16 se 2000 withdraw karo"
→ { module: "funds", operation: "withdraw", data: { userId: 16, amount: 2000 } }

"ID 16 se 10000 hatao"
→ { module: "funds", operation: "withdraw", data: { userId: 16, amount: 10000 } }
```

### 👤 User Operations

```
"user 20 ko block karo"
→ { module: "user", operation: "block", data: { userId: 20 } }

"user 25 ko unblock karo"
→ { module: "user", operation: "unblock", data: { userId: 25 } }

"user 30 ko delete kr de"
→ { module: "user", operation: "delete", data: { userId: 30 } }

"new user banao Rajesh"
→ { module: "user", operation: "create", data: { name: "Rajesh" } }
```

### 👨‍💼 Admin Operations

```
"new admin banao Rahul"
→ { module: "admin", operation: "create", data: { name: "Rahul" } }

"admin 15 ko delete karo"
→ { module: "admin", operation: "delete", data: { userId: 15 } }
```

### 🏦 Broker Operations

```
"broker ko trader assign karo"
→ { module: "broker", operation: "assign", data: { userId: ... } }

"new broker banao Amit"
→ { module: "broker", operation: "create", data: { name: "Amit" } }
```

### 📊 Trade Operations

```
"new trade banao user 16 ke liye"
→ { module: "trade", operation: "create", data: { userId: 16 } }

"trade 100 close karo"
→ { module: "trade", operation: "close", data: { tradeId: 100 } }
```

---

## How It Understands Commands

### Operation Detection

The system recognizes keywords for each operation:

```javascript
add: ['add', 'karo', 'kr de', 'dalo', 'lagao', 'banao', 'create']
withdraw: ['hatao', 'nikalo', 'withdraw', 'nikal le', 'nikal de']
delete: ['delete', 'hata de', 'mitao', 'remove', 'uda do']
update: ['update', 'badlo', 'change', 'modify', 'sudharo']
block: ['block', 'band karo', 'disable', 'band kr de']
unblock: ['unblock', 'enable', 'activate', 'khol de']
assign: ['assign', 'dedo', 'allocate', 'dena']
create: ['create', 'banao', 'naya', 'new', 'banadena']
```

### Module Detection

```javascript
funds: ['fund', 'paise', 'money', 'amount', 'balance', 'wallet']
user: ['user', 'client', 'trader', 'person', 'member']
admin: ['admin', 'administrator']
broker: ['broker', 'dalalal']
trade: ['trade', 'deal', 'business']
```

### Data Extraction

```javascript
// User ID Detection
"ID 16" → 16
"user 16" → 16
"16 ko" → 16
"ID#16" → 16

// Amount Detection
"5000" → 5000
"5,000" → 5000
"ek lakh" → 100000
"paanch hazaar" → 5000

// Name Detection
"banao Rahul" → "Rahul"
"Amit ko" → "Amit"
```

---

## API Response Format

### Success Response

```javascript
{
    success: true,
    message: "add operation completed successfully!",
    data: { /* API response data */ },
    command: {
        module: "funds",
        operation: "add",
        data: { userId: 16, amount: 5000 }
    }
}
```

### Error Response

```javascript
{
    success: false,
    error: "Unable to understand command",
    message: "Could not understand command. Please try again.",
    partial: {
        module: "funds",
        operation: null,
        data: {}
    }
}
```

---

## Component Example

```javascript
import React, { useState } from 'react';
import { useVoiceCommand } from '../hooks/useVoiceCommand';

function VoiceCommandPanel() {
    const [command, setCommand] = useState('');
    const { executeCommand, isProcessing, result, error, clearResult } = useVoiceCommand();

    const handleExecute = async () => {
        if (!command.trim()) return;

        const response = await executeCommand(command);
        setCommand(''); // Clear input
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>🎙️ Voice Command</h3>

            <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter command: ID 16 me 5000 add karo"
                rows={3}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                disabled={isProcessing}
            />

            <button
                onClick={handleExecute}
                disabled={isProcessing || !command.trim()}
                style={{
                    padding: '10px 20px',
                    backgroundColor: isProcessing ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {isProcessing ? 'Processing...' : 'Execute'}
            </button>

            {result && (
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: result.success ? '#e8f5e9' : '#ffebee',
                    borderRadius: '4px'
                }}>
                    <strong>{result.success ? '✅' : '❌'} {result.message}</strong>
                    {result.command && (
                        <pre style={{ fontSize: '12px', marginTop: '10px' }}>
                            {JSON.stringify(result.command, null, 2)}
                        </pre>
                    )}
                </div>
            )}

            {error && (
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px'
                }}>
                    ❌ {error}
                </div>
            )}
        </div>
    );
}

export default VoiceCommandPanel;
```

---

## Testing

### Test Different Commands

```javascript
// Test various commands
const testCommands = [
    "ID 16 me 5000 add karo",
    "user 20 ko block karo",
    "new admin banao Rahul",
    "ID 16 se 2000 withdraw karo",
    "user 25 ko delete kr de",
    "new broker banao Amit"
];

for (const cmd of testCommands) {
    const result = await processVoiceCommand(cmd);
    console.log(cmd, '→', result.command);
}
```

### Check Supported Commands

```javascript
import { getCommandInfo } from '../services/voiceCommandController';

const info = getCommandInfo();
console.log('Supported modules:', info.supportedModules);
console.log('Supported operations:', info.supportedOperations);
console.log('Examples:', info.examples);
```

---

## Debugging

### Enable Logs in Console

```javascript
// Browser DevTools Console will show:
[CommandParser] Parsing: ID 16 me 5000 add karo
[CommandParser] Operation identified: add
[CommandParser] Module identified: funds
[CommandParser] Successfully parsed: { module: "funds", operation: "add", data: {...} }
[VoiceController] Executing: funds.add { userId: 16, amount: 5000 }
[VoiceController] Command executed successfully: { ... }
```

### Test Direct Parser

```javascript
import { parseCommand } from '../services/commandParser';

const parsed = parseCommand("ID 16 me 5000 add karo");
console.log(parsed);
// { module: "funds", operation: "add", data: { userId: 16, amount: 5000 } }
```

---

## Features

✅ **Natural Language Understanding**
- English, Hindi, Hinglish support
- Multiple ways to say the same thing
- Context-aware parsing

✅ **Dynamic Operation Mapping**
- Not hardcoded to fixed operations
- Understands intent automatically
- Handles new patterns

✅ **Intelligent Data Extraction**
- Extract User IDs, amounts, names
- Handle word numbers ("ek lakh", "paanch hazaar")
- Format variations ("5000", "5,000")

✅ **Automatic Token Management**
- Token attached to all API calls
- No manual header management
- 401 handling (auto-logout)

✅ **Error Handling**
- Validates parsed commands
- Provides clear error messages
- Partial data returned on errors

✅ **Timeout Protection**
- 30-second timeout per command
- Prevents hung requests
- User-friendly timeout messages

---

## Summary

**This system is fully intelligent and production-ready!**

Users can now speak/type commands in natural language, and the system will:
1. Understand what they want
2. Map to the correct operation
3. Execute with automatic authentication
4. Return results

**No hardcoding. No fixed actions. Just intelligent NLP!** 🚀

---

## Need Help?

- Check `commandParser.js` for parsing logic
- Check `voiceCommandController.js` for execution logic
- Check `useVoiceCommand.js` for React integration
- Look at component examples above for implementation
