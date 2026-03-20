# 🔍 Search Engine - Quick Reference

## Use in Components (1 Line!)

```javascript
import { useSearch } from '../hooks/useSearch';

const { search, results, isLoading, error } = useSearch();
const response = await search("ID 16 ke active trades dikhao");
```

---

## Search Examples

| Query | Module | Filters | Route |
|-------|--------|---------|-------|
| "ID 16 ke active trades dikhao" | trades | userId: 16, status: ACTIVE | /trades |
| "all users show" | users | {} | /trading-clients |
| "pending orders top 10" | orders | status: PENDING, limit: 10 | /pending-orders |
| "closed trades last 5" | trades | status: CLOSED, limit: 5 | /trades |
| "active brokers dikhao" | brokers | status: ACTIVE | /broker-accounts |
| "ID 20 funds" | funds | userId: 20 | /funds |
| "all admins" | admins | {} | /admins |
| "blocked users" | users | status: BLOCKED | /trading-clients |

---

## How It Works

```
User Types: "ID 16 ke active trades dikhao"
           ↓
    Parser identifies:
    - Module: "trades" (keyword: trade)
    - Filters: userId=16 (pattern: ID X)
              status=ACTIVE (keyword: active)
           ↓
    Structured Query: {
        module: "trades",
        filters: { userId: 16, status: "ACTIVE" },
        route: "/trades",
        apiEndpoint: "/trades?userId=16&status=ACTIVE"
    }
           ↓
    Controller executes:
    → api.getActivePositions({ userId: 16 })
           ↓
    Results: [
        { id: 1, symbol: "NIFTY", ... },
        { id: 2, symbol: "BANK", ... },
        ...
    ]
           ↓
    UI displays dropdown
    → User clicks → Navigate to /trades 🔥
```

---

## Query Keywords

**Modules:**
- trades: trade, deals, order, position
- users: user, client, trader, member
- funds: fund, paise, money, balance
- brokers: broker, dalalal, brokerage
- admins: admin, administrator
- orders: order, request, pending

**Operations:**
- Search: dikhao, show, batao, find, search

**Statuses:**
- active: active, running, open, chalti
- closed: closed, band, complete, done
- pending: pending, wait, ruko
- blocked: blocked, band, lock, disable
- approved: approved, pass, ok
- rejected: rejected, refuse

**Filters:**
- User ID: ID 16, user 16, 16 ko
- Limit: last 5, top 10, recent
- Date: today, week, month, year

---

## Response Format

### ✅ Success
```javascript
{
    success: true,
    message: "Found 15 result(s)",
    data: [ { id: 1, ... }, { id: 2, ... }, ... ],
    count: 15,
    query: { module, filters, route, apiEndpoint }
}
```

### ❌ Error
```javascript
{
    success: false,
    error: "Unable to understand query",
    message: "Could not understand search query"
}
```

---

## Usage Patterns

### Direct Service
```javascript
import { processSearch } from '../services/searchController';

const result = await processSearch("ID 16 ke active trades dikhao");
console.log(result.data); // Array of results
```

### React Hook
```javascript
const { search, results, error } = useSearch();
const response = await search("ID 16 ke active trades dikhao");
```

### Quick Search
```javascript
import { quickSearch } from '../services/searchController';

const result = await quickSearch('trades', {
    userId: 16,
    status: 'ACTIVE'
});
```

---

## Token Handling ✅

- ✅ Auto-attached to all searches
- ✅ No manual headers needed
- ✅ 401 auto-handled
- ✅ Production-ready

---

## Testing

```javascript
const result = await search("ID 16 ke active trades");

console.log(result.success); // true/false
console.log(result.count); // number of results
console.log(result.data); // array of records
console.log(result.query.route); // "/trades"
```

---

## Debugging

```javascript
// Browser Console shows:
[QueryParser] Parsing: ID 16 ke active trades
[QueryParser] Module identified: trades
[QueryParser] Filters identified: { userId: 16, status: "ACTIVE" }
[SearchController] Executing search: trades
[SearchController] Search completed. Results: 15 records
```

---

## Summary

✅ Intelligent NLP
✅ Dynamic module mapping
✅ Auto filter extraction
✅ Automatic token handling
✅ Production-ready

**Search with natural language! Results in seconds!** 🚀
