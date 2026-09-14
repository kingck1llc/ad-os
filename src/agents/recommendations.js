import { analyze } from "./insights.js";

const HIGH = "high";
const MED = "medium";
const LOW = "low";

const rank = { high: 0, medium: 1, low: 2 };

const rec = (id, priority, title, detail, owner) => ({
  id,
  priority,
  title,
  detail,
  owner,
});

const sortRecs = (list) =>
  list.slice().sort((a, b) => rank[a.priority] - rank[b.priority]);

function complianceRecs(d, snap) {
  const out = [];
  snap.highAlerts.forEach((c, i) =>
    out.push(
      rec(
        `comp-high-${i}`,
        HIGH,
        c.item,
        `${c.area} — highest-severity item in the queue. Clear this before new roster or NIL volume.`,
        "Compliance Officer"
      )
    )
  );
  snap.overLimit.forEach((s) =>
    out.push(
      rec(
        `comp-over-${s.id}`,
        HIGH,
        `${s.name} is over the House roster limit`,
        `${s.current} on roster vs limit ${s.rosterLimit}. Freeze adds until the count is legal.`,
        "Compliance Officer"
      )
    )
  );
  snap.mediumAlerts.forEach((c, i) =>
    out.push(
      rec(
        `comp-med-${i}`,
        MED,
        c.item,
        `${c.area} — keep the clearinghouse clock visible; do not market the deal until cleared.`,
        "Compliance Officer"
      )
    )
  );
  if (!snap.overLimit.length) {
    out.push(
      rec(
        "comp-limits-ok",
        LOW,
        `All ${d.sports.length} sports are within House roster limits`,
        "Roster adds are legal on headcount. Still run each add through cap and Title IX.",
        "Compliance Officer"
      )
    );
  }
  return out;
}

function gmRecs(d, snap) {
  const out = [];
  if (snap.biggestGap) {
    const g = snap.biggestGap;
    out.push(
      rec(
        "gm-biggest-gap",
        g.gender === "W" && snap.titleIXGapPts > 0 ? HIGH : MED,
        `Fill ${g.open} open ${g.name} roster spot${g.open === 1 ? "" : "s"}`,
        `${g.current}/${g.rosterLimit} filled. ${
          g.gender === "W" && snap.titleIXGapPts > 0
            ? `Women's participation trails undergraduate mix by ${snap.titleIXGapPts} pts — this is the cheapest Title IX-positive add.`
            : "Largest remaining House-limit gap on the board."
        }`,
        "General Manager"
      )
    );
  }
  const next = snap.gaps[1];
  if (next) {
    out.push(
      rec(
        "gm-second-gap",
        LOW,
        `Second gap: ${next.name} (${next.open} open)`,
        `${next.current}/${next.rosterLimit}. Model after the primary add so cap and Title IX stay aligned.`,
        "General Manager"
      )
    );
  }
  const full = d.sports.filter((s) => s.current >= s.rosterLimit);
  if (full.length) {
    out.push(
      rec(
        "gm-full",
        LOW,
        `Do not add to ${full.map((s) => s.name).join(", ")}`,
        "Those sports are at the House limit. Any add would be a compliance miss.",
        "General Manager"
      )
    );
  }
  return out;
}

function cfoRecs(d, snap) {
  const out = [
    rec(
      "cfo-cap",
      snap.remaining < 1 ? HIGH : MED,
      `$${snap.remaining.toFixed(1)}M of rev-share cap remains (${snap.capPct}% used)`,
      `Committed $${d.revenueShare.committedMillions}M of $${d.revenueShare.capTotalMillions}M. Gate every roster or employee-NIL move through finance before the AD signs.`,
      "Chief Financial Officer"
    ),
  ];
  if (snap.biggestGap && snap.remaining >= 0.15) {
    out.push(
      rec(
        "cfo-cheap-add",
        MED,
        `A ${snap.biggestGap.name} add is a low-dollar cap use`,
        "Sample cost in this prototype is +$0.15M per spot — well inside remaining room if Compliance and Title IX agree.",
        "Chief Financial Officer"
      )
    );
  }
  snap.pendingNil.forEach((n, i) =>
    out.push(
      rec(
        `cfo-nil-${i}`,
        LOW,
        `${n.athlete} NIL is third-party — no cap hit`,
        `$${n.valueK}K / ${n.brand}. Track for reporting only; do not consume rev-share for it.`,
        "Chief Financial Officer"
      )
    )
  );
  return out;
}

function csoRecs(d, snap) {
  const out = [];
  if (snap.titleIXGapPts > 0) {
    const target = snap.womenRoom[0];
    out.push(
      rec(
        "cso-titleix",
        HIGH,
        `Close a ${snap.titleIXGapPts}-point Title IX participation gap`,
        `Female athletes are ${d.titleIX.femaleAthletePct}% vs ${d.titleIX.femaleUndergradPct}% undergraduates. ${
          target
            ? `Best lever: ${target.name} has ${target.open} open spots inside the House limit.`
            : "Model a women's sport add or scholarship mix — do not spend remaining cap only on revenue sports."
        }`,
        "Chief Strategy Officer"
      )
    );
  }
  out.push(
    rec(
      "cso-cap-choice",
      MED,
      `Decide where the remaining $${snap.remaining.toFixed(1)}M of cap goes`,
      "Two models: invest in one revenue sport, or spend on Title IX balance. Run both before FY allocation sign-off.",
      "Chief Strategy Officer"
    )
  );
  return out;
}

function cosRecs(d, snap) {
  const out = [];
  const firstHigh = snap.highAlerts[0];
  if (firstHigh) {
    out.push(
      rec(
        "cos-first",
        HIGH,
        `Start the day with: ${firstHigh.item}`,
        "Highest-severity cabinet item. Sequence Compliance → Academic/Culture if it is Title IX, then GM/CFO for any roster follow-through.",
        "Chief of Staff"
      )
    );
  }
  if (snap.staffing[0]) {
    out.push(
      rec(
        "cos-staffing",
        MED,
        `Unstick ${snap.staffing[0].name}`,
        `${snap.staffing[0].status} at ${snap.staffing[0].venue} (${snap.staffing[0].date}). COO owns execution; CMO should not promote a short-staffed night.`,
        "Chief of Staff"
      )
    );
  }
  if (snap.remaining > 0) {
    out.push(
      rec(
        "cos-cap-decision",
        MED,
        "Get a cap-allocation decision on the AD calendar this week",
        `$${snap.remaining.toFixed(1)}M uncommitted. Strategy and Finance should bring two options, not an open question.`,
        "Chief of Staff"
      )
    );
  }
  return out;
}

function smpRecs(d, snap) {
  return [
    rec(
      "smp-fy",
      MED,
      `Lock FY ${d.department.fiscalYear} milestones`,
      `Sequence: ${
        snap.highAlerts[0] ? snap.highAlerts[0].item + "; " : ""
      }roster finalization; rev-share allocation sign-off.`,
      "Strategic Management & Planning"
    ),
    rec(
      "smp-measure",
      LOW,
      "Attach a metric to every cabinet recommendation",
      "Title IX participation %, cap remaining, and roster gaps are already in the data pool — do not add projects without a number.",
      "Strategic Management & Planning"
    ),
  ];
}

function croRecs(d, snap) {
  const out = [
    rec(
      "cro-mix",
      LOW,
      `$${snap.revenue.toFixed(1)}M across ${d.revenueStreams.length} streams — largest is ${snap.topStream.name}`,
      `Protect ${snap.topStream.name} ($${snap.topStream.annualMillions.toFixed(1)}M). Do not spend political capital fighting a low-cost Title IX roster add.`,
      "Chief Revenue Officer"
    ),
  ];
  if (snap.ticketFill < 90) {
    out.push(
      rec(
        "cro-tickets",
        MED,
        `Convert ${snap.unsold.toLocaleString()} unsold season tickets (${snap.ticketFill}% filled)`,
        "Pair Ticket Ops with CMO. Single-game leftover is a second funnel, not a substitute for season-ticket close.",
        "Chief Revenue Officer"
      )
    );
  }
  return out;
}

function cdoRecs(d) {
  const dev = d.revenueStreams.find((r) => r.name.includes("Donations"));
  return [
    rec(
      "cdo-case",
      MED,
      "Reframe the donor case around the athlete pool",
      `Development is pacing to $${dev ? dev.annualMillions : 0}M. In the rev-share era, major gifts increasingly underwrite athlete compensation — say that plainly.`,
      "Chief Development Officer"
    ),
    rec(
      "cdo-titleix",
      LOW,
      "Offer a Title IX-positive gift opportunity",
      "Donors who will not fund football extras will fund women's roster and support services. Coordinate with Strategy so gifts map to open spots.",
      "Chief Development Officer"
    ),
  ];
}

function cmoRecs(d, snap) {
  const out = [
    rec(
      "cmo-tickets",
      MED,
      `Season tickets are ${snap.ticketFill}% sold — push conversion, not awareness`,
      `${d.tickets.seasonSold.toLocaleString()} of ${d.tickets.capacity.toLocaleString()}. Next single-game pool is ~${d.tickets.singleGameNext.toLocaleString()}.`,
      "Chief Marketing Officer"
    ),
  ];
  if (snap.pendingNil.length) {
    out.push(
      rec(
        "cmo-nil-hold",
        MED,
        `Hold campaigns for ${snap.pendingNil.map((n) => n.athlete).join(", ")}`,
        "Not cleared. Queue the story; do not publish until Compliance signs off.",
        "Chief Marketing Officer"
      )
    );
  }
  const cleared = d.nilDeals.filter((n) => n.status === "Cleared");
  if (cleared.length) {
    out.push(
      rec(
        "cmo-nil-go",
        LOW,
        `Amplify cleared NIL: ${cleared.map((n) => n.athlete).join(", ")}`,
        "Athlete storytelling is already legal. Use it to sell the remaining season inventory.",
        "Chief Marketing Officer"
      )
    );
  }
  if (snap.staffing[0]) {
    out.push(
      rec(
        "cmo-senior-night",
        LOW,
        `Do not over-promote ${snap.staffing[0].name} until staffing is green`,
        "A short-staffed Senior Night is a fan-experience miss. COO first, then CMO.",
        "Chief Marketing Officer"
      )
    );
  }
  return out;
}

function cooRecs(d, snap) {
  const out = [];
  snap.staffing.forEach((e, i) =>
    out.push(
      rec(
        `coo-staff-${i}`,
        HIGH,
        `Staff ${e.name}`,
        `${e.status} — ${e.venue} on ${e.date}. This is the next operations miss if it slips.`,
        "Chief Operating Officer"
      )
    )
  );
  snap.facilitiesOpen.forEach((f, i) =>
    out.push(
      rec(
        `coo-fac-${i}`,
        MED,
        `${f.name}: ${f.issue}`,
        `Status: ${f.status}. Coordinate with Equipment if training time is affected.`,
        "Chief Operating Officer"
      )
    )
  );
  d.events
    .filter((e) => e.status === "On track")
    .forEach((e, i) =>
      out.push(
        rec(
          `coo-ok-${i}`,
          LOW,
          `${e.name} is on track`,
          `${e.venue} on ${e.date}. Keep it off the AD's desk unless it slips.`,
          "Chief Operating Officer"
        )
      )
    );
  return out;
}

function cacRecs(d) {
  const out = [
    rec(
      "cac-gpa",
      d.academics.atRiskAthletes > 10 ? MED : LOW,
      `Team GPA ${d.academics.teamGPA}, grad rate ${d.academics.gradRate}%`,
      `${d.academics.atRiskAthletes} athletes flagged for academic support this term. Protect study-hall capacity if roster adds land in Olympic sports.`,
      "Chief Academics & Culture"
    ),
  ];
  if (d.academics.atRiskAthletes > 0) {
    out.push(
      rec(
        "cac-atrisk",
        MED,
        `Assign support plans for ${d.academics.atRiskAthletes} at-risk athletes`,
        "A roster add that improves Title IX but overloads academic support is a culture miss. Flag capacity before GM fills spots.",
        "Chief Academics & Culture"
      )
    );
  }
  return out;
}

function ticketRecs(d, snap) {
  return [
    rec(
      "tix-season",
      snap.ticketFill < 90 ? MED : LOW,
      `${snap.unsold.toLocaleString()} season tickets still open`,
      `${d.tickets.seasonSold.toLocaleString()}/${d.tickets.capacity.toLocaleString()} sold. Prioritize renewal/conversion over dumping inventory to the single-game window.`,
      "Ticket Operations"
    ),
    rec(
      "tix-single",
      LOW,
      `Next single-game on-sale pool: ~${d.tickets.singleGameNext.toLocaleString()}`,
      "Hold a slice for visiting demand; do not release everything after a slow midweek.",
      "Ticket Operations"
    ),
  ];
}

function eventRecs(d, snap) {
  const out = d.events.map((e, i) =>
    rec(
      `evt-${i}`,
      /staff/i.test(e.status) ? HIGH : LOW,
      `${e.name} — ${e.status}`,
      `${e.venue} on ${e.date}.`,
      "Event Management"
    )
  );
  if (!snap.staffing.length) {
    out.push(
      rec(
        "evt-clear",
        LOW,
        "No events currently flagged for staffing",
        "Keep the board current; the cabinet only sees slips that you post.",
        "Event Management"
      )
    );
  }
  return out;
}

function facRecs(d) {
  return d.facilities.map((f, i) =>
    rec(
      `fac-${i}`,
      f.status === "In progress" ? MED : LOW,
      `${f.name}: ${f.issue}`,
      `Status: ${f.status}.`,
      "Facilities"
    )
  );
}

function complianceOpsRecs(d, snap) {
  const next = snap.highAlerts[0] || snap.mediumAlerts[0] || d.compliance[0];
  const out = [
    rec(
      "cops-queue",
      next && next.severity === "high" ? HIGH : MED,
      `${d.compliance.length} item(s) in the compliance queue`,
      next
        ? `Work next: ${next.item} (${next.severity} / ${next.area}).`
        : "Queue is clear.",
      "Compliance Operations"
    ),
  ];
  snap.pendingNil.forEach((n, i) =>
    out.push(
      rec(
        `cops-nil-${i}`,
        MED,
        `Push clearinghouse packet for ${n.athlete}`,
        `${n.sport} / ${n.brand} / $${n.valueK}K — ${n.status}.`,
        "Compliance Operations"
      )
    )
  );
  return out;
}

function equipmentRecs(d, snap) {
  const weight = d.facilities.find((f) => /weight/i.test(f.name));
  const out = [];
  if (weight) {
    out.push(
      rec(
        "eq-weight",
        MED,
        `${weight.name}: ${weight.issue}`,
        `${weight.status}. Olympic-sport training windows may slip — confirm with Facilities before GM stacks more rowing/track volume.`,
        "Equipment Operations"
      )
    );
  }
  if (snap.womenRoom[0]) {
    out.push(
      rec(
        "eq-kit",
        LOW,
        `Check gear lead time if ${snap.womenRoom[0].name} roster grows`,
        "Apparel and boats/implements are not instant. Do not approve a spot the equipment room cannot kit.",
        "Equipment Operations"
      )
    );
  }
  return out;
}

function adRecs(d, snap) {
  const cabinet = [
    ...cosRecs(d, snap),
    ...csoRecs(d, snap),
    ...cfoRecs(d, snap),
    ...complianceRecs(d, snap).filter((r) => r.priority !== LOW),
    ...gmRecs(d, snap).filter((r) => r.priority !== LOW),
    ...cooRecs(d, snap).filter((r) => r.priority === HIGH),
  ];
  const seen = new Set();
  const merged = [];
  for (const r of sortRecs(cabinet)) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    merged.push(r);
  }
  return merged.slice(0, 5);
}

const builders = {
  ad: adRecs,
  cos: cosRecs,
  cso: csoRecs,
  smp: smpRecs,
  cro: croRecs,
  cdo: cdoRecs,
  cmo: cmoRecs,
  coo: cooRecs,
  cfo: cfoRecs,
  compliance: complianceRecs,
  cac: cacRecs,
  gm: gmRecs,
  ticket_ops: ticketRecs,
  event_ops: eventRecs,
  facilities: facRecs,
  compliance_ops: complianceOpsRecs,
  equipment_ops: equipmentRecs,
};

export function getRecommendations(agentId, data) {
  const snap = analyze(data);
  const build = builders[agentId];
  return sortRecs(build ? build(data, snap) : []);
}

export function formatRecommendations(recs) {
  if (!recs.length) return "No open recommendations. Standing by.";
  return recs
    .map(
      (r, i) =>
        `${i + 1}. [${r.priority.toUpperCase()}] ${r.title} — ${r.detail}${
          r.owner ? ` (${r.owner})` : ""
        }`
    )
    .join(" ");
}

export function asksForRecommendations(input) {
  const q = (input || "").toLowerCase();
  if (!q.trim()) return true;
  return (
    /recommend|priorit|what should|what do i|next step|advice|brief|standby|standing by|what needs/.test(
      q
    ) && !/budget|cap remaining|roster limit/.test(q)
  );
}
