import { remaining, highAlerts } from "./insights.js";
import {
  asksForRecommendations,
  formatRecommendations,
  getRecommendations,
} from "./recommendations.js";

const highAlertText = (d) =>
  highAlerts(d)
    .map((c) => c.item)
    .join("; ");

function withRecs(id, specialized) {
  return (input, d) => {
    if (asksForRecommendations(input)) {
      return formatRecommendations(getRecommendations(id, d));
    }
    if (specialized) {
      const extra = specialized(input, d);
      if (extra) return extra;
    }
    return formatRecommendations(getRecommendations(id, d));
  };
}

export const cabinet = [
  {
    id: "ad",
    title: "Athletic Director",
    group: "Executive Cabinet",
    blurb: "Your main command interface. Ask anything; it pulls from the whole department.",
    respond: withRecs("ad", (input, d) => {
      const q = (input || "").toLowerCase();
      if (q.includes("budget") || q.includes("cap"))
        return `Revenue-share pool: $${d.revenueShare.committedMillions}M committed of $${d.revenueShare.capTotalMillions}M cap. About $${remaining(d)}M uncommitted.`;
      if (q.includes("compliance") || q.includes("alert"))
        return `Open high-priority items: ${highAlertText(d) || "none"}.`;
      if (q.includes("roster"))
        return `Roster snapshot: ${d.sports.length} sports tracked against House settlement limits. Ask the General Manager for a specific sport.`;
      return null;
    }),
  },
  {
    id: "cos",
    title: "Chief of Staff",
    group: "Executive Cabinet",
    blurb: "Keeps the cabinet aligned and surfaces what needs your attention.",
    respond: withRecs("cos"),
  },
  {
    id: "cso",
    title: "Chief Strategy Officer",
    group: "Executive Cabinet",
    blurb: "Long-range positioning, conference realignment, competitive strategy.",
    respond: withRecs("cso"),
  },
  {
    id: "smp",
    title: "Strategic Management & Planning",
    group: "Executive Cabinet",
    blurb: "Turns strategy into projects, timelines, and measurable goals.",
    respond: withRecs("smp"),
  },
  {
    id: "cro",
    title: "Chief Revenue Officer",
    group: "Executive Cabinet",
    blurb: "Owns total top-line revenue across all streams.",
    respond: withRecs("cro"),
  },
  {
    id: "cdo",
    title: "Chief Development Officer",
    group: "Executive Cabinet",
    blurb: "Fundraising, major gifts, and donor relationships.",
    respond: withRecs("cdo"),
  },
  {
    id: "cmo",
    title: "Chief Marketing Officer",
    group: "Executive Cabinet",
    blurb: "Brand, fan engagement, attendance, and athlete storytelling.",
    respond: withRecs("cmo"),
  },
  {
    id: "coo",
    title: "Chief Operating Officer",
    group: "Executive Cabinet",
    blurb: "Day-to-day operations: events, facilities, logistics.",
    respond: withRecs("coo"),
  },
  {
    id: "cfo",
    title: "Chief Financial Officer",
    group: "Executive Cabinet",
    blurb: "Budget, the revenue-share cap, and financial compliance.",
    respond: withRecs("cfo"),
  },
  {
    id: "compliance",
    title: "Compliance Officer",
    group: "Executive Cabinet",
    blurb: "NCAA rules, House settlement roster limits, Title IX, and NIL clearance.",
    respond: withRecs("compliance"),
  },
  {
    id: "cac",
    title: "Chief Academics & Culture",
    group: "Executive Cabinet",
    blurb: "Academic performance, athlete wellbeing, and department culture.",
    respond: withRecs("cac"),
  },
];

export const middleManagement = [
  {
    id: "gm",
    title: "General Manager",
    group: "Roster & Operations",
    blurb: "Recommends roster moves within cap and roster-limit rules.",
    respond: withRecs("gm"),
  },
  {
    id: "ticket_ops",
    title: "Ticket Operations",
    group: "Roster & Operations",
    blurb: "Season and single-game ticketing.",
    respond: withRecs("ticket_ops"),
  },
  {
    id: "event_ops",
    title: "Event Management",
    group: "Roster & Operations",
    blurb: "Game-day and event execution.",
    respond: withRecs("event_ops"),
  },
  {
    id: "facilities",
    title: "Facilities",
    group: "Roster & Operations",
    blurb: "Venue readiness and maintenance.",
    respond: withRecs("facilities"),
  },
  {
    id: "compliance_ops",
    title: "Compliance Operations",
    group: "Roster & Operations",
    blurb: "Day-to-day paperwork behind the Compliance Officer.",
    respond: withRecs("compliance_ops"),
  },
  {
    id: "equipment_ops",
    title: "Equipment Operations",
    group: "Roster & Operations",
    blurb: "Gear, apparel contracts, and inventory.",
    respond: withRecs("equipment_ops"),
  },
];
