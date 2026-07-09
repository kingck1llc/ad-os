import { useState } from "react";
import { sampleData } from "./data/sampleData";
import { cabinet, middleManagement } from "./agents/agents";

export default function App() {
  const [data, setData] = useState(sampleData);
  const [activeId, setActiveId] = useState("ad");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "Athletic Director", text: cabinet[0].respond("", sampleData) },
  ]);
  const [feed, setFeed] = useState([
    { who: "System", text: "AD-OS online. Sample data loaded." },
  ]);

  const agents = [...cabinet, ...middleManagement];
  const active = agents.find((a) => a.id === activeId);

  const capRemaining = (
    data.revenueShare.capTotalMillions - data.revenueShare.committedMillions
  ).toFixed(1);
  const capPct = Math.round(
    (data.revenueShare.committedMillions / data.revenueShare.capTotalMillions) * 100
  );
  const highAlerts = data.compliance.filter((c) => c.severity === "high").length;

  const log = (who, text) => setFeed((f) => [{ who, text }, ...f]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: "You", text: q }]);
    const reply = active.respond(q, data);
    setMessages((m) => [...m, { from: active.title, text: reply }]);
    setInput("");
  };

  // --- Cross-agent trigger #1: a roster change ripples through the cabinet ---
  const addRosterSpot = () => {
    setData((d) => ({
      ...d,
      sports: d.sports.map((s) =>
        s.id === "wrow" ? { ...s, current: s.current + 1 } : s
      ),
      revenueShare: {
        ...d.revenueShare,
        committedMillions: +(d.revenueShare.committedMillions + 0.15).toFixed(2),
      },
    }));
    log("General Manager", "Proposed: add 1 roster spot to Women's Rowing.");
    log("CFO", "Cap check: +$0.15M. Still under the revenue-share cap. Approved.");
    log("Compliance Officer", "Roster check: Women's Rowing within House limit. Title IX: female participation improves.");
    log("Chief Revenue Officer", "Low cost, supports Title IX balance. No revenue objection.");
    log("Athletic Director", "Decision logged: Rowing spot approved. Cap and Title IX impacts recorded.");
  };

  // --- Cross-agent trigger #2: a new NIL deal ---
  const logNilDeal = () => {
    log("Compliance Operations", "New NIL deal submitted: Sample Athlete C ($22K, apparel).");
    log("Compliance Officer", "Routed to clearinghouse review (over reporting threshold). Status: Pending.");
    log("CFO", "Third-party NIL — no revenue-share cap impact. Noted for reporting.");
    log("Chief Marketing Officer", "Queued for a co-branded social campaign once cleared.");
    log("Athletic Director", "NIL deal tracked end-to-end. Awaiting clearinghouse result.");
  };

  // --- Cross-agent trigger #3: every cabinet member reports in ---
  const cabinetBriefing = () => {
    cabinet.forEach((a) => log(a.title, a.respond("brief", data)));
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">AD-OS</div>
        <div className="sub">Athletics Director Operating System — {data.department.school}</div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="group-label">Executive Cabinet</div>
          {cabinet.map((a) => (
            <button
              key={a.id}
              className={"agent" + (a.id === activeId ? " active" : "")}
              onClick={() => setActiveId(a.id)}
            >
              {a.title}
            </button>
          ))}
          <div className="group-label">Roster & Operations</div>
          {middleManagement.map((a) => (
            <button
              key={a.id}
              className={"agent" + (a.id === activeId ? " active" : "")}
              onClick={() => setActiveId(a.id)}
            >
              {a.title}
            </button>
          ))}
        </aside>

        <main className="center">
          <div className="agent-header">
            <h2>{active.title}</h2>
            <p>{active.blurb}</p>
          </div>

          {activeId === "ad" && (
            <div className="actions">
              <button onClick={cabinetBriefing}>Run cabinet briefing</button>
              <button onClick={addRosterSpot}>Simulate: add a Women's Rowing spot</button>
              <button onClick={logNilDeal}>Simulate: log a new NIL deal</button>
            </div>
          )}

          <div className="chat">
            {messages.map((m, i) => (
              <div key={i} className={"msg " + (m.from === "You" ? "you" : "bot")}>
                <span className="from">{m.from}</span>
                <span className="text">{m.text}</span>
              </div>
            ))}
          </div>

          <div className="composer">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`Ask the ${active.title}...`}
            />
            <button onClick={send}>Send</button>
          </div>
        </main>

        <aside className="right">
          <div className="cards">
            <div className="card">
              <div className="card-num">${capRemaining}M</div>
              <div className="card-label">Rev-share cap remaining ({capPct}% used)</div>
            </div>
            <div className="card">
              <div className="card-num">{data.sports.length}</div>
              <div className="card-label">Sports tracked vs roster limits</div>
            </div>
            <div className="card">
              <div className="card-num">{data.titleIX.femaleAthletePct}%</div>
              <div className="card-label">Female athlete participation</div>
            </div>
            <div className="card alert">
              <div className="card-num">{highAlerts}</div>
              <div className="card-label">High-priority compliance alerts</div>
            </div>
          </div>

          <div className="feed">
            <div className="group-label">Activity Feed (agent triggers)</div>
            {feed.map((f, i) => (
              <div key={i} className="feed-item">
                <span className="feed-who">{f.who}</span>
                <span className="feed-text">{f.text}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
