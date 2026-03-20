/**
 * AI Command Parser — OpenAI-Powered Natural Language → Structured Intent
 *
 * Uses OpenAI GPT-4 mini for superior understanding of:
 * - Hindi, Hinglish, English commands
 * - Voice transcription errors & typos
 * - Ambiguous user intent
 *
 * Safety net catches common errors (ID/amount swaps)
 * Falls back to rule-based parsing if OpenAI fails
 */

const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const DB_SCHEMA = `
Tables in our trading software MySQL database:

users (id, name, email, balance, status[active/blocked], role[admin/trader/client], created_at)
trades (id, user_id, symbol, type[buy/sell], qty, price, status[open/closed/pending], created_at)
funds (id, user_id, amount, type[credit/debit], note, created_at)
ledger (id, user_id, amount, type, balance_after, created_at)
portfolio (id, user_id, symbol, qty, avg_price, updated_at)
alerts (id, user_id, symbol, condition, value, active, created_at)
settings (id, key, value, updated_at)
admins (id, user_id, permissions, created_at)
`;

const SUPPORTED_ACTIONS = `
ADD_FUND, DEDUCT_FUND, BLOCK_USER, UNBLOCK_USER, DELETE_USER,
CREATE_ADMIN, CLOSE_TRADE, SHOW_USERS, SHOW_TRADES, SHOW_FUNDS,
CHECK_USER, UPDATE_BALANCE, UPDATE_SETTING, CREATE_ALERT
`;

// ─────────────────────────────────────────────────────────────────────────────
// PARSING EXAMPLES — Teaches OpenAI how to extract ID vs Amount correctly
// ─────────────────────────────────────────────────────────────────────────────

const PARSING_EXAMPLES = `
CRITICAL RULE — How to extract ID vs Amount:

The number that comes RIGHT AFTER "id", "user", "ID", "user id" keywords = that is the USER ID.
The number that comes after "add", "deposit", "credit", "me", "mein", "ko" = that is the AMOUNT.

EXAMPLES (study these carefully):

Input:  "add 3000 in user id 16"
Output: { "action": "ADD_FUND", "filters": { "id": 16 }, "data": { "amount": 3000 } }
Why: "user id 16" → id=16. "add 3000" → amount=3000.

Input:  "ID 16 me 5000 add karo"
Output: { "action": "ADD_FUND", "filters": { "id": 16 }, "data": { "amount": 5000 } }
Why: "ID 16" → id=16. "5000 add" → amount=5000.

Input:  "user 16 mein 3000 daalo"
Output: { "action": "ADD_FUND", "filters": { "id": 16 }, "data": { "amount": 3000 } }
Why: "user 16" → id=16. "3000 daalo" → amount=3000.

Input:  "user id 5 se 2000 hatao"
Output: { "action": "DEDUCT_FUND", "filters": { "id": 5 }, "data": { "amount": 2000 } }
Why: "user id 5" → id=5. "2000 hatao" → amount=2000.

Input:  "add 500 to user 22"
Output: { "action": "ADD_FUND", "filters": { "id": 22 }, "data": { "amount": 500 } }
Why: "user 22" → id=22. "add 500" → amount=500.

Input:  "user 8 ka 10000 balance update karo"
Output: { "action": "UPDATE_BALANCE", "filters": { "id": 8 }, "data": { "amount": 10000 } }
Why: "user 8" → id=8. "10000 balance" → amount=10000.

Input:  "block user 20"
Output: { "action": "BLOCK_USER", "filters": { "id": 20 }, "data": {} }
Why: "user 20" → id=20. No amount needed.

Input:  "close trade 100"
Output: { "action": "CLOSE_TRADE", "filters": { "id": 100 }, "data": {} }
Why: "trade 100" → trade id=100. No amount needed.

WRONG (never do this):
Input:  "add 3000 in user id 16"
WRONG Output: { "filters": { "id": 3000 }, "data": { "amount": 16 } }  ← NEVER swap them!
`;

// ─────────────────────────────────────────────────────────────────────────────
// OPENAI-POWERED PARSER
// ─────────────────────────────────────────────────────────────────────────────

const parseCommandWithOpenAI = async (text) => {
  const systemPrompt = `You are a command parser for a trading software admin panel.
Parse user commands in Hindi, English, or Hinglish into structured JSON.

Database Schema:
${DB_SCHEMA}

Supported Operations:
${SUPPORTED_ACTIONS}

${PARSING_EXAMPLES}

STRICT RULES:
1. Respond with ONLY valid JSON — no explanation, no markdown, no extra text.
2. NEVER swap ID and amount. The user/entity identifier goes in filters.id, the money goes in data.amount.
3. Keywords that signal USER ID: "user", "id", "ID", "user id", "user ID", "trade", "trader"
4. Keywords that signal AMOUNT: "add", "deposit", "credit", "daalo", "hatao", "deduct", "withdraw", "me", "mein"
5. If a sentence has two numbers: smaller context numbers near "id/user" = ID, larger standalone numbers = amount (but always use context first).
6. If unclear, use action: "UNKNOWN".

Response format (MUST BE VALID JSON):
{
  "module": "users|trades|funds|ledger|payment_requests|banks|alerts|portfolio|support_tickets|ip_logins|notifications|global_configs",
  "operation": "read|create|update|delete|block|unblock|add_fund|withdraw|transfer|close|approve|reject|aggregate|unknown",
  "action": "ACTION_FROM_LIST",
  "filters": { "id": <USER_ID_NUMBER> },
  "data": { "amount": <AMOUNT_NUMBER> },
  "displayMessage": "Hindi/Hinglish confirmation message",
  "route": "/funds",
  "raw": "original command text"
}`;

  try {
    console.log(`[OpenAI Parser] Processing: "${text}"`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Parse this command: "${text}"` },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    let jsonStr = content;
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

    const parsed = JSON.parse(jsonStr.trim());
    parsed.raw = text;

    // ─────────────────────────────────────────────────────────────────
    // SAFETY NET: Detect and fix ID/amount swaps
    // ─────────────────────────────────────────────────────────────────
    safetyCheck(text, parsed);

    console.log(`[OpenAI Parser] ✅ Result:`, JSON.stringify({
      module: parsed.module,
      operation: parsed.operation,
      filters: parsed.filters,
      data: parsed.data,
    }));

    return parsed;
  } catch (err) {
    console.error(`[OpenAI Parser] ❌ Error:`, err.message);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY NET — Detect & Fix Common Parsing Errors
// ─────────────────────────────────────────────────────────────────────────────

function safetyCheck(text, parsed) {
  // Extract ID using regex (direct from text)
  const idMatch = text.match(/(?:user\s*id|user|ID|id|trade)\s*[:#]?\s*(\d+)/i);

  // Extract amount using regex (direct from text)
  const amountMatch = text.match(
    /(?:add|deposit|credit|daalo|hatao|deduct|withdraw|me|mein)\s+(\d+)|(\d+)\s+(?:add|daalo|hatao|deposit|credit|deduct|withdraw)/i
  );

  if (idMatch && amountMatch) {
    const extractedId = parseInt(idMatch[1]);
    const extractedAmount = parseInt(amountMatch[1] || amountMatch[2]);

    const currentId = parsed?.filters?.id;
    const currentAmount = parsed?.data?.amount;

    // Check if AI swapped ID and amount
    if (currentId === extractedAmount && currentAmount === extractedId) {
      console.warn(
        `[SafetyNet] ⚠️  ID/Amount swap detected! Fixing: id=${extractedId}, amount=${extractedAmount}`
      );
      parsed.filters.id = extractedId;
      parsed.data.amount = extractedAmount;
    }
  }

  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK RULE-BASED PARSER
// ─────────────────────────────────────────────────────────────────────────────

const OP_READ = [
  "show", "list", "get", "fetch", "view", "display", "find", "search", "see",
  "dikhao", "dikha", "batao", "bata", "dekho", "dekh", "dekhao", "dedo", "lao",
];

const OP_CREATE = [
  "create", "add", "new", "insert", "make", "register",
  "banao", "bana", "naya", "nayi", "dalo", "daalo", "jodo",
];

const OP_UPDATE = [
  "update", "edit", "change", "modify", "set",
  "badlo", "badal", "karo", "kar",
];

const OP_DELETE = [
  "delete", "remove", "destroy", "drop", "erase",
  "hatao", "hata", "mita", "mitao",
];

const OP_BLOCK = ["block", "suspend", "band", "roko", "disable"];
const OP_UNBLOCK = ["unblock", "activate", "chalu", "kholo", "enable"];
const OP_ADD_FUND = ["deposit", "jama", "credit", "add"];
const OP_WITHDRAW = ["withdraw", "deduct", "nikalo"];

const extractNumbers = (text) => {
  const numbers = [];
  const matches = text.match(/\b\d+\b/g);
  if (matches) {
    matches.forEach((m) => {
      const num = parseInt(m, 10);
      if (!numbers.includes(num)) numbers.push(num);
    });
  }
  return numbers;
};

const ruleBasedParse = (text) => {
  const tl = text.toLowerCase();
  const numbers = extractNumbers(text);

  const result = {
    module: null,
    operation: "read",
    filters: {},
    data: {},
    sort: null,
    limit: null,
    route: null,
    raw: text,
  };

  // Detect operation
  if (OP_BLOCK.some((w) => tl.includes(w))) {
    result.operation = "block";
  } else if (OP_UNBLOCK.some((w) => tl.includes(w))) {
    result.operation = "unblock";
  } else if (OP_ADD_FUND.some((w) => tl.includes(w))) {
    result.operation = "add_fund";
  } else if (OP_WITHDRAW.some((w) => tl.includes(w))) {
    result.operation = "withdraw";
  } else if (OP_CREATE.some((w) => tl.includes(w))) {
    result.operation = "create";
  } else if (OP_UPDATE.some((w) => tl.includes(w))) {
    result.operation = "update";
  } else if (OP_DELETE.some((w) => tl.includes(w))) {
    result.operation = "delete";
  }

  // Detect module
  if (/\bfund|balance|pais[ae]|jama|nikasi/.test(tl)) {
    result.module = "funds";
    result.route = "/funds";
  } else if (/\btrade|order|position|sauda/.test(tl)) {
    result.module = "trades";
    result.route = "/trades";
  } else if (/\buser|account|member|trader|client|admin|broker/.test(tl)) {
    result.module = "users";
    result.route = "/accounts";
  } else {
    result.module = "users";
    result.route = "/accounts";
  }

  // Extract ID
  if (numbers.length > 0) {
    result.filters.id = numbers[0];
    if (result.operation === "add_fund" || result.operation === "withdraw") {
      if (numbers.length > 1) {
        result.data.amount = numbers[1];
      }
    }
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PARSER - TRY OPENAI FIRST, FALLBACK TO RULES
// ─────────────────────────────────────────────────────────────────────────────

const parseCommand = async (text) => {
  if (!text || !text.trim()) {
    throw new Error("Command text is required");
  }

  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      return await parseCommandWithOpenAI(text);
    } catch (err) {
      console.warn(
        `[parseCommand] OpenAI failed, falling back to rules:`,
        err.message
      );
    }
  }

  // Fallback to rule-based parser
  console.log(`[parseCommand] Using rule-based parser`);
  return ruleBasedParse(text);
};

module.exports = { parseCommand };
