1. Backend Folder Structure (Simple)
backend/
 ├── controllers/
 │     └── aiController.js   👉 yaha AI logic rahega
 ├── routes/
 │     └── aiRoutes.js       👉 API route
 ├── config/
 │     └── openai.js         👉 OpenAI setup
 ├── middleware/             👉 (optional validation / security)
 ├── .env                    👉 SECRET KEY yaha rahegi
 ├── server.js               👉 main server
🔐 2. Secret Key kaha rakhni hai

👉 .env file (IMPORTANT)

OPENAI_API_KEY=sk-xxxxxxx

👉 Kabhi bhi:

frontend me ❌
GitHub pe ❌
🧠 3. Prompt kaha dalna hai (IMPORTANT)

👉 Tumne bola: “antigravity me dalna hai”

✔️ Correct understanding:

👉 Prompt backend me hi use hota hai
👉 specifically:

📍 aiController.js me
👉 jaha tum OpenAI call karte ho

🧠 4. FINAL PROMPT (Use this)
You are an AI assistant for a stock trading mobile app.

You understand Hindi, English, and Hinglish.
Always reply in the same language as the user.

App Features:
- Buy/Sell stocks
- View portfolio
- View trades
- Navigate pages (watchlist, trades, portfolio, account)

Rules:
- Always return JSON only
- No extra text
- Understand user intent clearly

Response format:

{
  "action": "buy | sell | navigate | portfolio | trades | none",
  "symbol": "",
  "quantity": 0,
  "page": "",
  "message": ""
}
⚙️ 5. Backend me kya kya banana hai (Flow)

👉 Step by step:

User ka message aayega (chat / voice se)
Backend me /api/chat hit hoga
aiController:
prompt + message OpenAI ko bhejega
OpenAI:
intent samjhega
JSON return karega
Backend:
JSON frontend ko bhej dega
Frontend:
action perform karega (navigate / buy / sell)
📱 6. Frontend (Expo) me kya karna hai

👉 Tumhe bas:

Chat input
Mic button (voice)
API call backend ko
AI response handle
❌ 7. Kya nahi karna (Important)
❌ OpenAI directly frontend se call mat karo
❌ Secret key React Native me mat daalo
❌ AI ko direct trading execute karne mat do
❌ बिना confirm ke order mat place karo
🎯 FINAL SIMPLE SUMMARY

👉 Prompt 👉 backend controller me
👉 Secret key 👉 .env file me
👉 AI call 👉 backend se
👉 Frontend 👉 sirf API call kare