# 🔍 Universal Search/Query Engine

## Overview

A **fully intelligent** search system that:
1. ✅ Understands search queries (English/Hindi/Hinglish)
2. ✅ Dynamically maps to modules (trades, users, funds, brokers, admins, orders)
3. ✅ Extracts filters (userId, status, amount, limit)
4. ✅ Fetches data from backend
5. ✅ Returns results for UI display
6. ✅ Routes to filtered pages

---

## Architecture

```
User Search Query (Voice/Text)
        ↓
Query Parser (NLP)
  ├─ Identify module (trades, users, funds, etc.)
  ├─ Identify operation (get/create/update/delete)
  └─ Extract filters (userId, status, limit, etc.)
        ↓
Structured JSON Query
  {
    "module": "trades",
    "operation": "get",
    "filters": { "userId": 16, "status": "ACTIVE" },
    "route": "/trades",
    "apiEndpoint": "/trades?userId=16&status=ACTIVE"
  }
        ↓
Search Controller
  └─ Route to correct API executor
        ↓
API Execution (with automatic token)
  └─ Backend database query
        ↓
Results Array (0-N records)
  [{id: 1, ...}, {id: 2, ...}, ...]
        ↓
UI Dropdown/List Display
  └─ User clicks → Navigate to filtered page 🔥
```

---

## Files

| File | Purpose |
|------|---------|
| `services/queryParser.js` | Parse search queries → JSON |
| `services/searchController.js` | Execute searches & fetch data |
| `hooks/useSearch.js` | React hook for components |

---

## Supported Modules

| Module | Keywords | Route | Filters |
|--------|----------|-------|---------|
| **trades** | trade, deals, order, position | /trades | userId, status (ACTIVE/CLOSED), limit |
| **users** | user, client, trader, member | /trading-clients | userId, status (ACTIVE/BLOCKED), limit |
| **funds** | fund, paise, money, balance | /funds | userId, status, amount, limit |
| **brokers** | broker, dalalal, brokerage | /broker-accounts | status, limit |
| **admins** | admin, administrator | /admins | userId, status, limit |
| **orders** | order, pending, request | /pending-orders | status (PENDING/APPROVED/REJECTED), limit |

---

## Usage Examples

### 1️⃣ Using React Hook (Recommended)

```javascript
import { useSearch } from '../hooks/useSearch';

function SearchBar() {
    const { search, results, isLoading, error, message } = useSearch();

    const handleSearch = async () => {
        const response = await search("ID 16 ke active trades dikhao");

        if (response.success) {
            console.log('✅ Found', response.count, 'results');
            // Display results in dropdown
        } else {
            console.error('❌ Error:', response.error);
        }
    };

    return (
        <div>
            <button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
            </button>

            {error && <p style={{color: 'red'}}>{error}</p>}
            {message && <p>{message}</p>}

            <ul>
                {results.map(result => (
                    <li key={result.id}>{result.name || result.id}</li>
                ))}
            </ul>
        </div>
    );
}
```

### 2️⃣ Direct Service Call

```javascript
import { processSearch } from '../services/searchController';

// Execute search
const result = await processSearch("ID 16 ke active trades dikhao");

if (result.success) {
    console.log('Results:', result.data);
    console.log('Query:', result.query);
    console.log('Route:', result.query.route); // "/trades"
} else {
    console.log('Error:', result.error);
}
```

### 3️⃣ Quick Search (Structured)

```javascript
import { quickSearch } from '../services/searchController';

// Direct search with known parameters
const result = await quickSearch('trades', {
    userId: 16,
    status: 'ACTIVE',
    limit: 10
});

console.log(result.data); // Array of trades
```

---

## Supported Search Queries

### 💰 Trades

```
"ID 16 ke active trades dikhao"
→ { module: "trades", filters: { userId: 16, status: "ACTIVE" }, route: "/trades" }

"all closed trades"
→ { module: "trades", filters: { status: "CLOSED" }, route: "/trades" }

"recent trades top 5"
→ { module: "trades", filters: { limit: 5 }, route: "/trades" }
```

### 👤 Users

```
"ID 20 dikhao"
→ { module: "users", filters: { userId: 20 }, route: "/trading-clients" }

"all active users"
→ { module: "users", filters: { status: "ACTIVE" }, route: "/trading-clients" }

"blocked users show"
→ { module: "users", filters: { status: "BLOCKED" }, route: "/trading-clients" }
```

### 💰 Funds

```
"all funds dikhao"
→ { module: "funds", filters: {}, route: "/funds" }

"pending deposits"
→ { module: "funds", filters: { status: "PENDING" }, route: "/funds" }

"recent withdrawals top 10"
→ { module: "funds", filters: { status: "WITHDRAWAL", limit: 10 }, route: "/funds" }
```

### 🏦 Brokers

```
"all brokers"
→ { module: "brokers", filters: {}, route: "/broker-accounts" }

"active brokers"
→ { module: "brokers", filters: { status: "ACTIVE" }, route: "/broker-accounts" }
```

### 👨‍💼 Admins

```
"all admins dikhao"
→ { module: "admins", filters: {}, route: "/admins" }

"admin 5"
→ { module: "admins", filters: { userId: 5 }, route: "/admins" }
```

### 📋 Orders

```
"pending orders dikhao"
→ { module: "orders", filters: { status: "PENDING" }, route: "/pending-orders" }

"approved orders"
→ { module: "orders", filters: { status: "APPROVED" }, route: "/pending-orders" }

"latest orders last 10"
→ { module: "orders", filters: { limit: 10 }, route: "/pending-orders" }
```

---

## How It Understands Queries

### Query Keywords

| Keyword | Meaning |
|---------|---------|
| dikhao, show, batao, dekho, find, search | GET operation |
| ID X, user X | Filter by userId |
| active, running, open | status: ACTIVE |
| closed, band, complete | status: CLOSED |
| pending, wait, ruko | status: PENDING |
| blocked, band, lock | status: BLOCKED |
| approved | status: APPROVED |
| rejected | status: REJECTED |
| last 5, top 10, recent | limit: 5 or 10 |
| today, week, month, year | dateRange filter |

---

## API Response Format

### Success Response

```javascript
{
    success: true,
    message: "Found 15 result(s). Searching trades for user 16 with status: ACTIVE",
    data: [
        { id: 1, symbol: "NIFTY50", quantity: 100, ... },
        { id: 2, symbol: "BANKNIFTY", quantity: 50, ... },
        ...
    ],
    count: 15,
    query: {
        module: "trades",
        filters: { userId: 16, status: "ACTIVE" },
        route: "/trades",
        apiEndpoint: "/trades?userId=16&status=ACTIVE"
    }
}
```

### Error Response

```javascript
{
    success: false,
    error: "Unable to understand query",
    message: "Could not understand search query. Please try again.",
    query: {
        error: "Unable to understand query..."
    }
}
```

---

## Component Example

```javascript
import React, { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

function SearchPanel() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { search, results, isLoading, error, message, count } = useSearch();

    const handleSearch = async () => {
        if (!query.trim()) return;
        const response = await search(query);

        // Store results in state for dropdown display
    };

    const handleResultClick = (result, route) => {
        // Navigate to filtered page with the result
        navigate(route, { state: { selectedId: result.id } });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>🔍 Search Dashboard</h3>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'ID 16 ke active trades dikhao'"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading || !query.trim()}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isLoading ? '#ccc' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </div>

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

            {message && !error && (
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    borderRadius: '4px'
                }}>
                    ✅ {message}
                </div>
            )}

            {results.length > 0 && (
                <div style={{
                    marginTop: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {results.map((result) => (
                            <li
                                key={result.id}
                                onClick={() => handleResultClick(result, '/trades')}
                                style={{
                                    padding: '12px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    hover: { backgroundColor: '#f5f5f5' }
                                }}
                            >
                                <strong>{result.name || result.symbol || result.id}</strong>
                                <br />
                                <small style={{ color: '#666' }}>
                                    {result.status || result.role || 'N/A'}
                                </small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {results.length === 0 && !error && message && (
                <div style={{ marginTop: '15px', color: '#999' }}>
                    No results found
                </div>
            )}
        </div>
    );
}

export default SearchPanel;
```

---

## Testing

### Test Different Queries

```javascript
const testQueries = [
    "ID 16 ke active trades dikhao",
    "all users show",
    "pending orders top 10",
    "closed trades last 5",
    "active brokers dikhao",
    "ID 20 funds"
];

for (const q of testQueries) {
    const result = await processSearch(q);
    console.log(q, '→', result.query);
}
```

### Check Supported Modules

```javascript
import { getSupportedModules } from '../services/queryParser';

const modules = getSupportedModules();
console.log('Supported modules:', modules);
```

---

## Features

✅ **Natural Language Understanding**
- English, Hindi, Hinglish support
- Multiple ways to express same query
- Context-aware parsing

✅ **Dynamic Module Mapping**
- Recognizes 6 different modules
- Intelligent module inference
- Route generation

✅ **Smart Filter Extraction**
- User ID detection
- Status detection
- Limit/pagination detection
- Date range detection
- Amount detection

✅ **Automatic Token Management**
- Token attached to all searches
- No manual authentication
- 401 error handling

✅ **Flexible Result Display**
- Array of results
- Result count
- Error messages
- Navigation routes

---

## Debugging

### Enable Console Logs

```javascript
// Browser DevTools Console will show:
[QueryParser] Parsing: ID 16 ke active trades dikhao
[QueryParser] Module identified: trades
[QueryParser] Filters identified: { userId: 16, status: "ACTIVE" }
[SearchController] Executing search: trades
[SearchController] Search completed. Results: 15 records
```

### Test Parser Directly

```javascript
import { parseQuery } from '../services/queryParser';

const parsed = parseQuery("ID 16 ke active trades dikhao");
console.log(parsed);
// { module: "trades", filters: { userId: 16, status: "ACTIVE" }, ... }
```

---

## Summary

**This universal search system is fully intelligent and production-ready!**

Users can now search in natural language, and the system will:
1. Understand what they're searching for
2. Map to the correct module
3. Extract filters automatically
4. Fetch data with authentication
5. Display results for navigation

**No hardcoding. Fully dynamic. Just intelligent NLP!** 🚀

---

## Need Help?

- Check `queryParser.js` for parsing logic
- Check `searchController.js` for execution logic
- Check `useSearch.js` for React integration
- Look at component examples above for implementation
