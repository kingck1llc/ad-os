const remaining = (d) =>
  (d.revenueShare.capTotalMillions - d.revenueShare.committedMillions).toFixed(1);

const highAlerts = (d) =>
  d.compliance.filter((c) => c.severity === "high").map((c) => c.item);

export const cabinet = [
  {
    id: "ad",
    title: "Athletic Director",
    group: "Executive Cabinet",
    blurb: "Your main command interface. Ask anything; it pulls from the whole department.",
    respond: (input, d) => {
      const q = input.toLowerCase();
      if (q.includes("budget") || q.includes("cap"))
        return `Revenue-share pool: $${d.revenueShare.committedMillions}M committed of $${d.revenueShare.capTotalMillions}M cap. About $${remaining(d)}M uncommitted.`;
      if (q.includes("compliance") || q.includes("alert"))
        return `Open high-priority items: ${highAlerts(d).join("; ") || "none"}.`;
      if (q.includes("roster"))
        return `Roster snapshot: ${d.sports.length} sports tracked against House settlement limits. Ask the General Manager for a specific sport.`;
      return `Cabinet standing by. Try: "budget status", "compliance alerts", "roster limits", or use the quick actions to simulate a decision.`;
    },
  },
  {
    id: "cos",
    title: "Chief of Staff",
    group: "Executive Cabinet",
    blurb: "Keeps the cabinet aligned and surfaces what needs your attention.",
    respond: (i, d) =>
      `Today's priorities: ${highAlerts(d).join("; ") || "steady state, nothing urgent"}. I'd start with the Title IX report.`,
  },
  {
    id: "cso",
    title: "Chief Strategy Officer",
    group: "Executive Cabinet",
    blurb: "Long-range positioning, conference realignment, competitive strategy.",
    respond: (i, d) =>
      `Strategic read: with $${remaining(d)}M of cap space uncommitted, we have room to invest in one revenue sport or shore up Title IX balance. I recommend modeling both.`,
  },
  {
    id: "smp",
    title: "Strategic Management & Planning",
    group: "Executive Cabinet",
    blurb: "Turns strategy into projects, timelines, and measurable goals.",
    respond: (i, d) =>
      `Active plan: FY ${d.department.fiscalYear}. Next milestones: quarterly Title IX report, roster finalization, and rev-share allocation sign-off.`,
  },
  {
    id: "cro",
    title: "Chief Revenue Officer",
    group: "Executive Cabinet",
    blurb: "Owns total top-line revenue across all streams.",
    respond: (i, d) => {
      const total = d.revenueStreams.reduce((s, r) => s + r.annualMillions, 0);
      const top = d.revenueStreams.slice().sort((a, b) => b.annualMillions - a.annualMillions)[0];
      return `Projected revenue: $${total.toFixed(1)}M across ${d.revenueStreams.length} streams. Largest: ${top.name}.`;
    },
  },
  {
    id: "cdo",
    title: "Chief Development Officer",
    group: "Executive Cabinet",
    blurb: "Fundraising, major gifts, and donor relationships.",
    respond: (i, d) => {
      const dev = d.revenueStreams.find((r) => r.name.includes("Donations"));
      return `Development pacing to $${dev ? dev.annualMillions : 0}M. In the rev-share era, donors increasingly fund the athlete pool — I'm reframing the case for support.`;
    },
  },
  {
    id: "cmo",
    title: "Chief Marketing Officer",
    group: "Executive Cabinet",
    blurb: "Brand, fan engagement, attendance, and athlete storytelling.",
    respond: (i, d) =>
      `Season tickets: ${d.tickets.seasonSold.toLocaleString()} of ${d.tickets.capacity.toLocaleString()} (${Math.round((d.tickets.seasonSold / d.tickets.capacity) * 100)}% sold). Focus: convert single-game buyers and amplify athlete NIL stories.`,
  },
  {
    id: "coo",
    title: "Chief Operating Officer",
    group: "Executive Cabinet",
    blurb: "Day-to-day operations: events, facilities, logistics.",
    respond: (i, d) =>
      `Operations: ${d.events.length} events on the board, ${d.facilities.filter((f) => f.status !== "Scheduled").length} facility item(s) in progress. Volleyball Senior Night still needs staffing.`,
  },
  {
    id: "cfo",
    title: "Chief Financial Officer",
    group: "Executive Cabinet",
    blurb: "Budget, the revenue-share cap, and financial compliance.",
    respond: (i, d) =>
      `Cap position: $${d.revenueShare.committedMillions}M committed / $${d.revenueShare.capTotalMillions}M cap. Every roster or NIL move runs through me for cap impact before approval.`,
  },
  {
    id: "compliance",
    title: "Compliance Officer",
    group: "Executive Cabinet",
    blurb: "NCAA rules, House settlement roster limits, Title IX, and NIL clearance.",
    respond: (i, d) => {
      const over = d.sports.filter((s) => s.current > s.rosterLimit);
      return over.length
        ? `ALERT — ${over.length} sport(s) over roster limit: ${over.map((s) => s.name).join(", ")}.`
        : `All ${d.sports.length} sports within House settlement roster limits. ${d.compliance.filter((c) => c.severity === "high").length} high-priority item(s) open.`;
    },
  },
  {
    id: "cac",
    title: "Chief Academics & Culture",
    group: "Executive Cabinet",
    blurb: "Academic performance, athlete wellbeing, and department culture.",
    respond: (i, d) =>
      `Team GPA ${d.academics.teamGPA}, grad rate ${d.academics.gradRate}%. ${d.academics.atRiskAthletes} athletes flagged for academic support this term.`,
  },
];

export const middleManagement = [
  {
    id: "gm",
    title: "General Manager",
    group: "Roster & Operations",
    blurb: "Recommends roster moves within cap and roster-limit rules.",
    respond: (i, d) => {
      const room = d.sports.filter((s) => s.current < s.rosterLimit);
      const biggest = room.slice().sort((a, b) => (b.rosterLimit - b.current) - (a.rosterLimit - a.current))[0];
      return `${room.length} sport(s) have open roster spots. Biggest gap: ${biggest ? biggest.name : "none"}. Use the quick action to simulate adding a spot.`;
    },
  },
  {
    id: "ticket_ops",
    title: "Ticket Operations",
    group: "Roster & Operations",
    blurb: "Season and single-game ticketing.",
    respond: (i, d) =>
      `Season sold: ${d.tickets.seasonSold.toLocaleString()}/${d.tickets.capacity.toLocaleString()}. Next single-game on sale: ~${d.tickets.singleGameNext.toLocaleString()} available.`,
  },
  {
    id: "event_ops",
    title: "Event Management",
    group: "Roster & Operations",
    blurb: "Game-day and event execution.",
    respond: (i, d) =>
      `Upcoming: ${d.events.map((e) => `${e.name} (${e.status})`).join("; ")}.`,
  },
  {
    id: "facilities",
    title: "Facilities",
    group: "Roster & Operations",
    blurb: "Venue readiness and maintenance.",
    respond: (i, d) =>
      `${d.facilities.map((f) => `${f.name}: ${f.issue} — ${f.status}`).join("; ")}.`,
  },
  {
    id: "compliance_ops",
    title: "Compliance Operations",
    group: "Roster & Operations",
    blurb: "Day-to-day paperwork behind the Compliance Officer.",
    respond: (i, d) => {
      const next = d.compliance.find((c) => c.severity === "high");
      return `${d.compliance.length} item(s) in the queue. Next due: ${next ? next.item : "nothing high-priority"}.`;
    },
  },
  {
    id: "equipment_ops",
    title: "Equipment Operations",
    group: "Roster & Operations",
    blurb: "Gear, apparel contracts, and inventory.",
    respond: (i, d) =>
      `Inventory steady. Weight room platforms out for repair may affect Olympic-sport training — coordinating with Facilities.`,
  },
];
