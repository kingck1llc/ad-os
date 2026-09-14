# AD-OS — Athletics Director Operating System

A web-based command center for Division I athletic directors in the House v. NCAA settlement era. Staffed by AI agents that share one data pool and trigger cross-department follow-ups.

**Sample data only.** Numbers (including the ~$20.5M revenue-share cap) are placeholders. This is a prototype/demo — not legal, compliance, or financial advice.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open the URL shown (usually http://localhost:5173/).

## Demo

1. The Athletic Director opens with **cabinet recommendations** ranked from the shared data pool (Title IX, roster gaps, cap, staffing).
2. Click other agents in the left sidebar — each has its own recommendation list. Ask "what should I do".
3. Ask the Athletic Director "budget status" or "roster limits" for the older keyword answers.
4. **Run cabinet briefing** — every executive posts their top recommendation to the activity feed.
5. **Simulate: add a Women's Rowing spot** — GM → CFO → Compliance → CRO → AD cascade; cap remaining and GM recs update.
6. **Simulate: log a new NIL deal** — compliance and marketing chain fires; CMO recs hold uncleared campaigns.
