const OpenAI = require("openai");

let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
    console.warn("⚠️  OPENAI_API_KEY missing in .env — AI commands will use rule-based fallback.");
}

const DB_SCHEMA = `
MySQL Database Tables:
users     (id, name, email, phone, balance, status[Active/Blocked], role[ADMIN/TRADER/CLIENT/BROKER], created_at)
trades    (id, user_id, symbol, type[buy/sell], qty, price, status[OPEN/CLOSED/PENDING], created_at)
funds     (id, user_id, amount, type[credit/debit], note, created_at)
ledger    (id, user_id, amount, type, balance_after, created_at)
portfolio (id, user_id, symbol, qty, avg_price, updated_at)
alerts    (id, user_id, symbol, condition, value, active, created_at)
brokers   (id, name, email, status, created_at)
admins    (id, user_id, permissions, created_at)
`;

const EXAMPLES = `
CRITICAL EXAMPLES — learn ID vs amount vs name:

"rahul ke trades dikhao"       → filters:{ userName:"rahul" }, module:"trades", searchType:"user_trades"
"AKA ki positions"             → filters:{ userName:"AKA" }, module:"trades", searchType:"user_trades"
"ID 16 ke trades"              → filters:{ userId:16 }, module:"trades", searchType:"user_trades"
"user 16 ka balance"           → filters:{ userId:16 }, module:"users", searchType:"user_detail"
"rahul ka balance"             → filters:{ userName:"rahul" }, module:"users", searchType:"user_detail"
"rahul ke funds"               → filters:{ userName:"rahul" }, module:"funds", searchType:"user_funds"
"add 3000 in user id 16"       → filters:{ userId:16 }, data:{ amount:3000 }, action:"ADD_FUND"
"ID 16 me 5000 add karo"       → filters:{ userId:16 }, data:{ amount:5000 }, action:"ADD_FUND"
"trading clients dikhao"       → filters:{ role:"TRADER" }, module:"users", searchType:"list"
"active trades"                → filters:{ status:"OPEN" }, module:"trades", searchType:"list"
"blocked users"                → filters:{ status:"Blocked" }, module:"users", searchType:"list"
"rahul ko block karo"          → filters:{ userName:"rahul" }, action:"BLOCK_USER"

RULES:
- Number after "user/ID/id" keyword = userId (integer → filters.userId)
- Proper noun near "ke/ka/ki/dikhao/show" = userName (string → filters.userName)
- Number after "add/deposit/daalo/hatao/deduct" = amount (→ data.amount, NEVER into filters)
- searchType: user_trades | user_detail | user_funds | user_portfolio | list
`;

async function parseCommand(text) {
  const systemPrompt = `You are a smart parser for a trading software admin panel.
Understand Hindi, English, Hinglish. Convert to structured JSON for DB queries.

${DB_SCHEMA}
${EXAMPLES}

IMPORTANT: Only recognize commands that are CLEAR and ACTIONABLE.
If the command is unclear, ambiguous, or doesn't match any known patterns, return:
{
  "module": null,
  "operation": "unknown",
  "action": null,
  "searchType": null,
  "filters": {},
  "data": {},
  "displayMessage": "Kripya apne command ko dobara puchiye ya alag tareeke se samjhaye",
  "route": null,
  "raw": "text here"
}

Respond ONLY with valid JSON. No explanation. No markdown.

JSON format:
{
  "module": "users|trades|funds|portfolio|alerts|brokers|admins|null",
  "operation": "list|search|add_fund|deduct_fund|block|unblock|delete|close_trade|unknown",
  "action": "ADD_FUND|DEDUCT_FUND|BLOCK_USER|UNBLOCK_USER|DELETE_USER|CLOSE_TRADE|null",
  "searchType": "list|user_trades|user_detail|user_funds|user_portfolio|null",
  "filters": {
    "userId": null,
    "userName": null,
    "role": null,
    "status": null,
    "symbol": null
  },
  "data": { "amount": null },
  "displayMessage": "Hindi confirm message",
  "route": "/route",
  "raw": "original text"
}`;

  try {
    if (!openai) {
        throw new Error("OpenAI API key missing");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 400,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Parse: "${text}"` },
      ],
      response_format: { type: "json_object" },
    });

    let parsed = JSON.parse(response.choices[0].message.content);
    parsed.raw = text;
    parsed = safetyCheck(text, parsed);

    // Validation: if module is null or operation is unknown, try fallback
    if (!parsed.module || parsed.operation === "unknown") {
      console.warn(`[Parser] OpenAI returned unknown, trying rule-based fallback: "${text}"`);
      return ruleBasedFallback(text);
    }

    console.log(`[Parser] ✅ OpenAI success: "${text}" →`, JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (err) {
    console.error("[Parser Error]", err.message);
    console.log("[Parser] Falling back to rule-based parser");
    return ruleBasedFallback(text);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RULE-BASED FALLBACK — works for common voice commands without OpenAI
// ─────────────────────────────────────────────────────────────────────────────

function ruleBasedFallback(text) {
  const t = text.toLowerCase().trim();

  // Extract numbers and names
  const userIdMatch = text.match(/(?:user\s*id|user|ID|id)\s*[:#]?\s*(\d+)/i);
  const userId = userIdMatch ? parseInt(userIdMatch[1]) : null;
  const amountMatch = text.match(/(?:add|deposit|credit|daalo)\s+(\d+)|(\d+)\s+(?:add|daalo|me\s+add|me\s+daalo)/i);
  const amount = amountMatch ? parseInt(amountMatch[1] || amountMatch[2]) : null;

  // Check for names (proper nouns)
  const nameMatch = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
  const userName = nameMatch ? nameMatch[1] : null;

  // ADD_FUND
  if (/add|deposit|credit|daalo|jama/.test(t) && userId && amount) {
    return {
      module: "funds",
      operation: "add_fund",
      action: "ADD_FUND",
      searchType: null,
      filters: { userId, userName: null, role: null, status: null, symbol: null },
      data: { amount },
      displayMessage: `User ${userId} ko ${amount} add karna hai?`,
      route: "/funds",
      raw: text
    };
  }

  // DEDUCT_FUND / WITHDRAW
  const withdrawMatch = text.match(/(?:hatao|deduct|withdraw|nikalo|minus)\s+(\d+)|(\d+)\s+(?:hatao|deduct|nikalo)/i);
  const withdrawAmount = withdrawMatch ? parseInt(withdrawMatch[1] || withdrawMatch[2]) : null;
  if (/hatao|deduct|withdraw|nikalo|minus/.test(t) && userId && withdrawAmount) {
    return {
      module: "funds",
      operation: "deduct_fund",
      action: "DEDUCT_FUND",
      searchType: null,
      filters: { userId, userName: null, role: null, status: null, symbol: null },
      data: { amount: withdrawAmount },
      displayMessage: `User ${userId} se ${withdrawAmount} hatana hai?`,
      route: "/funds",
      raw: text
    };
  }

  // BLOCK_USER
  if (/block|suspend|band\s*karo/.test(t) && userId) {
    return {
      module: "users",
      operation: "block",
      action: "BLOCK_USER",
      searchType: null,
      filters: { userId, userName: null, role: null, status: null, symbol: null },
      data: {},
      displayMessage: `User ${userId} ko block karna hai?`,
      route: "/users",
      raw: text
    };
  }

  if (/block|suspend|band\s*karo/.test(t) && userName) {
    return {
      module: "users",
      operation: "block",
      action: "BLOCK_USER",
      searchType: null,
      filters: { userId: null, userName, role: null, status: null, symbol: null },
      data: {},
      displayMessage: `${userName} ko block karna hai?`,
      route: "/users",
      raw: text
    };
  }

  // UNBLOCK_USER
  if (/unblock|activate|kholo|chalu/.test(t) && userId) {
    return {
      module: "users",
      operation: "unblock",
      action: "UNBLOCK_USER",
      searchType: null,
      filters: { userId, userName: null, role: null, status: null, symbol: null },
      data: {},
      displayMessage: `User ${userId} ko unblock karna hai?`,
      route: "/users",
      raw: text
    };
  }

  // DELETE_USER
  if (/delete|hatao|remove/.test(t) && /user/.test(t) && userId) {
    return {
      module: "users",
      operation: "delete",
      action: "DELETE_USER",
      searchType: null,
      filters: { userId, userName: null, role: null, status: null, symbol: null },
      data: {},
      displayMessage: `User ${userId} ko delete karna hai?`,
      route: "/users",
      raw: text
    };
  }

  // CLOSE_TRADE
  const tradeIdMatch = text.match(/trade\s+(\d+)|(\d+)\s+close/i);
  const tradeId = tradeIdMatch ? parseInt(tradeIdMatch[1] || tradeIdMatch[2]) : null;
  if (/close|band/.test(t) && /trade/.test(t) && tradeId) {
    return {
      module: "trades",
      operation: "close_trade",
      action: "CLOSE_TRADE",
      searchType: null,
      filters: { userId: null, userName: null, role: null, status: null, symbol: null },
      data: { tradeId },
      displayMessage: `Trade ${tradeId} ko close karna hai?`,
      route: "/trades",
      raw: text
    };
  }

  // SHOW_TRADES
  if (/trade|position/.test(t) && userName) {
    return {
      module: "trades",
      operation: "search",
      action: null,
      searchType: "user_trades",
      filters: { userId: null, userName, role: null, status: null, symbol: null },
      data: {},
      displayMessage: `${userName} ke trades dikhane hain?`,
      route: "/trades",
      raw: text
    };
  }

  if (/trade|position/.test(t) && userId) {
    return {
      module: "trades",
      operation: "search",
      action: null,
      searchType: "user_trades",
      filters: { userId, userName: null, role: null, status: null, symbol: null },
      data: {},
      displayMessage: `User ${userId} ke trades dikhane hain?`,
      route: "/trades",
      raw: text
    };
  }

  // SHOW_USERS - traders/clients
  if (/trader|trading.*client/.test(t)) {
    return {
      module: "users",
      operation: "list",
      action: null,
      searchType: "list",
      filters: { userId: null, userName: null, role: "TRADER", status: null, symbol: null },
      data: {},
      displayMessage: "Trading clients dikhane hain?",
      route: "/users",
      raw: text
    };
  }

  // Default: unknown
  console.log(`[Parser] Rule-based fallback also failed: "${text}"`);
  return {
    module: null,
    operation: "unknown",
    action: null,
    searchType: null,
    filters: {},
    data: {},
    displayMessage: "Kripya apne command ko dobara puchiye ya alag tareeke se samjhaye",
    route: null,
    raw: text,
    error: "Command not understood"
  };
}

function safetyCheck(text, parsed) {
  const idMatch = text.match(/(?:user\s*id|user|ID|id)\s*[:#]?\s*(\d+)/i);
  const amountMatch = text.match(
    /(?:add|deposit|credit|daalo|hatao|deduct|withdraw)\s+(\d+)|(\d+)\s+(?:add|daalo|hatao|deposit)/i
  );

  if (idMatch && amountMatch) {
    const eId = parseInt(idMatch[1]);
    const eAmt = parseInt(amountMatch[1] || amountMatch[2]);

    if (parsed?.filters?.userId === eAmt && parsed?.data?.amount === eId) {
      console.warn("[SafetyNet] ID/Amount swap fixed");
      parsed.filters.userId = eId;
      parsed.data.amount = eAmt;
    }
  }

  return parsed;
}

module.exports = { parseCommand };

/*
TEST QUERIES — ye sab ab kaam karni chahiye:
- "rahul ke trades dikhao"
- "AKA ki positions"
- "ID 16 ke trades"
- "user 16 ka balance"
- "add 3000 in user id 16"    → id=16, amount=3000 (NEVER swap)
- "ID 16 me 5000 add karo"    → id=16, amount=5000
- "trading clients dikhao"
- "active trades"
- "blocked users"
- "rahul ko block karo"
*/
