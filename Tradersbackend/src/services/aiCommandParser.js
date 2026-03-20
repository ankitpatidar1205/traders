/**
 * AI Command Parser — OpenAI-Powered Natural Language → Structured Intent
 *
 * Uses OpenAI GPT-4 mini for superior understanding of:
 * - Hindi, Hinglish, English commands
 * - Voice transcription errors & typos
 * - Ambiguous user intent
 *
 * Falls back to rule-based parsing if OpenAI fails
 */

const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE SCHEMA (Used in AI prompts)
// ─────────────────────────────────────────────────────────────────────────────

const DB_SCHEMA = `
Database Tables (Trading Admin Panel):

1. users
   - id (PK), username, password, full_name, email, mobile, balance, credit_limit,
   - role (SUPERADMIN/ADMIN/BROKER/TRADER), status (Active/Inactive/Suspended)
   - created_at, updated_at

2. trades
   - id (PK), user_id (FK), symbol, type (BUY/SELL), quantity, entry_price,
   - exit_price, status (OPEN/CLOSED/PENDING), pnl, created_at, updated_at

3. funds
   - id (PK), user_id (FK), amount, type (DEPOSIT/WITHDRAWAL), note, created_at

4. ledger
   - id (PK), user_id (FK), amount, type (DEPOSIT/WITHDRAW), balance_after, remarks, created_at

5. payment_requests
   - id (PK), user_id (FK), amount, type (DEPOSIT/WITHDRAW), status (PENDING/APPROVED/REJECTED),
   - created_at, updated_at

6. portfolio
   - id (PK), user_id (FK), symbol, quantity, average_price, current_price, updated_at

7. alerts
   - id (PK), user_id (FK), symbol, condition, value, active, created_at

8. banks
   - id (PK), user_id (FK), account_holder, account_number, ifsc, bank_name, created_at

9. support_tickets
   - id (PK), user_id (FK), subject, description, status (OPEN/IN_PROGRESS/RESOLVED), created_at

10. ip_logins
    - id (PK), user_id (FK), ip_address, login_time, logout_time

11. action_ledger
    - id (PK), user_id (FK), action, details, created_at

12. notifications
    - id (PK), user_id (FK), message, read (0/1), created_at

13. global_configs
    - id (PK), key, value, updated_at
`;

const SUPPORTED_OPERATIONS = `
FUNDS OPERATIONS:
  add_fund - ADD funds to user balance
  withdraw - WITHDRAW funds from user
  transfer - TRANSFER funds between users

USER OPERATIONS:
  read - SHOW/LIST users with filters
  create - CREATE new user/admin/broker
  update - UPDATE user details
  block - BLOCK/SUSPEND user
  unblock - UNBLOCK/ACTIVATE user
  delete - DELETE user

TRADE OPERATIONS:
  read - SHOW/LIST trades
  create - CREATE new trade
  close - CLOSE trade
  delete - DELETE trade

LEDGER OPERATIONS:
  read - SHOW transaction history
  aggregate - COUNT/SUM transactions

PAYMENT REQUEST OPERATIONS:
  read - SHOW requests
  approve - APPROVE request
  reject - REJECT request
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
${SUPPORTED_OPERATIONS}

CRITICAL RULES:
1. Respond with ONLY valid JSON - no explanation, no markdown code blocks
2. Never output \`\`\`json or \`\`\` markers
3. Extract ALL numbers, IDs, amounts, names from the command
4. Map Hindi/Hinglish to English operations
5. If command is unclear, set operation to "unknown"
6. Always include "raw" field with original text

Response format (MUST BE VALID JSON):
{
  "module": "users|trades|funds|ledger|payment_requests|banks|alerts|portfolio|support_tickets|ip_logins|notifications|global_configs",
  "operation": "read|create|update|delete|block|unblock|add_fund|withdraw|transfer|close|approve|reject|aggregate|unknown",
  "filters": { "id": 16, "status": "Active", "role": "TRADER" },
  "data": { "amount": 5000, "full_name": "Rahul" },
  "sort": null,
  "limit": null,
  "route": "/trading-clients",
  "raw": "original command text"
}

Examples:
- "ID 16 me 5000 add karo" → module: "funds", operation: "add_fund", filters: {id: 16}, data: {amount: 5000}
- "Saare traders dikhao" → module: "users", operation: "read", filters: {role: "TRADER"}
- "User 20 ko block karo" → module: "users", operation: "block", filters: {id: 20}
- "Closed trades dikha" → module: "trades", operation: "read", filters: {status: "CLOSED"}`;

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
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }

    const parsed = JSON.parse(jsonStr.trim());
    parsed.raw = text;

    console.log(`[OpenAI Parser] ✅ Result:`, JSON.stringify({
      module: parsed.module,
      operation: parsed.operation,
      filters: parsed.filters,
    }));

    return parsed;
  } catch (err) {
    console.error(`[OpenAI Parser] ❌ Error:`, err.message);
    throw err;
  }
};

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
      console.warn(`[parseCommand] OpenAI failed, falling back to rules:`, err.message);
    }
  }

  // Fallback to rule-based parser
  console.log(`[parseCommand] Using rule-based parser`);
  return ruleBasedParse(text);
};

module.exports = { parseCommand };
