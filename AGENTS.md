# AD-OS — agent notes

Vite + React prototype. Sample data only — not legal, compliance, or financial advice.

## Run

```bash
npm ci
npm test
npm run build
npm run dev -- --host
```

Dev server: `http://localhost:5173/` (already started in Cloud Agent environments via `start`).

## Verify UI changes

Open the app and exercise the flow a real AD would use:

1. Athletic Director should show a **Cabinet recommendations** list on load (Title IX, roster gap, cap, staffing).
2. Ask the AD `what should I do` and `budget status` — recommendations vs. cap figures.
3. Switch agents (GM, Compliance, CMO). Each has its own recommendation list; chat seeds with that agent's recs.
4. **Run cabinet briefing** — feed gets each cabinet member's top rec.
5. **Simulate: add a Women's Rowing spot** — cap remaining drops; GM recs go from 7 open spots to 6.
6. **Simulate: log a new NIL deal** — CMO recs should hold campaigns for uncleared athletes (including Athlete C).

Check the activity feed and the four metric cards after simulations. Recs are derived from `src/data/sampleData.js` plus live React state.

## Where logic lives

- `src/data/sampleData.js` — department snapshot
- `src/agents/insights.js` — derived metrics (cap, roster gaps, Title IX delta)
- `src/agents/recommendations.js` — per-agent ranked recs
- `src/agents/agents.js` — chat `respond()` (recommendation-first, plus AD keyword answers)
- `src/App.jsx` — shell, simulations, recs panel

Do not treat House-settlement dollar figures as current law; they are placeholders.

## Tests

`npm test` covers ranking, GM roster-gap updates, over-limit compliance, AD keyword routing, and NIL hold recs. There is no e2e framework — browser-check the demo paths above after UI changes.
