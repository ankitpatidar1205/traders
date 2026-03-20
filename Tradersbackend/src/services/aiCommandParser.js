const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  "displayMessage": "Command not recognized. Please be more specific.",
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

    // Validation: if module is null or operation is unknown, it means the command wasn't recognized
    if (!parsed.module || parsed.operation === "unknown") {
      console.warn(`[Parser] Command rejected as unclear: "${text}"`);
      return {
        module: null,
        operation: "unknown",
        action: null,
        searchType: null,
        filters: {},
        data: {},
        displayMessage: "Command not recognized. Please be specific. Example: 'rahul ke trades' or 'user 16 block karo'",
        route: null,
        raw: text,
        error: "Command not clear"
      };
    }

    console.log(`[Parser] "${text}" →`, JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (err) {
    console.error("[Parser Error]", err.message);
    return {
      module: null,
      operation: "unknown",
      action: null,
      searchType: null,
      filters: {},
      data: {},
      displayMessage: "Error parsing command. Please try again.",
      route: null,
      raw: text,
      error: err.message,
    };
  }
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
