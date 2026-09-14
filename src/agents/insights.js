/** Derived department snapshot used by recommendation logic. */

export const capRemaining = (d) =>
  +(d.revenueShare.capTotalMillions - d.revenueShare.committedMillions).toFixed(2);

export const capUsedPct = (d) =>
  Math.round(
    (d.revenueShare.committedMillions / d.revenueShare.capTotalMillions) * 100
  );

export const rosterGaps = (d) =>
  d.sports
    .map((s) => ({
      ...s,
      open: s.rosterLimit - s.current,
    }))
    .filter((s) => s.open > 0)
    .sort((a, b) => b.open - a.open);

export const overLimitSports = (d) =>
  d.sports.filter((s) => s.current > s.rosterLimit);

export const alertsBySeverity = (d, severity) =>
  d.compliance.filter((c) => c.severity === severity);

export const remaining = (d) => capRemaining(d).toFixed(1);

export const highAlerts = (d) => alertsBySeverity(d, "high");

export const titleIXGap = (d) =>
  +(d.titleIX.femaleUndergradPct - d.titleIX.femaleAthletePct).toFixed(1);

export const ticketFillPct = (d) =>
  Math.round((d.tickets.seasonSold / d.tickets.capacity) * 100);

export const unsoldSeason = (d) => d.tickets.capacity - d.tickets.seasonSold;

export const totalRevenue = (d) =>
  d.revenueStreams.reduce((sum, r) => sum + r.annualMillions, 0);

export const topRevenueStream = (d) =>
  d.revenueStreams.slice().sort((a, b) => b.annualMillions - a.annualMillions)[0];

export const pendingNil = (d) =>
  d.nilDeals.filter((n) => n.status !== "Cleared");

export const staffingEvents = (d) =>
  d.events.filter((e) => /staff/i.test(e.status));

export const openFacilities = (d) =>
  d.facilities.filter((f) => f.status !== "Scheduled");

export const womenSportsWithRoom = (d) =>
  rosterGaps(d).filter((s) => s.gender === "W");

export const analyze = (d) => ({
  remaining: capRemaining(d),
  capPct: capUsedPct(d),
  gaps: rosterGaps(d),
  biggestGap: rosterGaps(d)[0] || null,
  overLimit: overLimitSports(d),
  highAlerts: alertsBySeverity(d, "high"),
  mediumAlerts: alertsBySeverity(d, "medium"),
  lowAlerts: alertsBySeverity(d, "low"),
  titleIXGapPts: titleIXGap(d),
  ticketFill: ticketFillPct(d),
  unsold: unsoldSeason(d),
  revenue: totalRevenue(d),
  topStream: topRevenueStream(d),
  pendingNil: pendingNil(d),
  staffing: staffingEvents(d),
  facilitiesOpen: openFacilities(d),
  womenRoom: womenSportsWithRoom(d),
});
