export const sampleData = {
  department: {
    school: "State University (Sample)",
    conference: "Sample Power Conference",
    fiscalYear: "2025-26",
  },

  // NOTE: The revenue-share cap is a placeholder. The real House settlement
  // figure (~$20.5M in year one) changes over time — verify before real use.
  revenueShare: {
    capTotalMillions: 20.5,
    committedMillions: 17.9,
  },

  sports: [
    { id: "fb",   name: "Football",            gender: "M", rosterLimit: 105, current: 103 },
    { id: "mbb",  name: "Men's Basketball",    gender: "M", rosterLimit: 15,  current: 15  },
    { id: "wbb",  name: "Women's Basketball",  gender: "W", rosterLimit: 15,  current: 14  },
    { id: "wvb",  name: "Women's Volleyball",  gender: "W", rosterLimit: 18,  current: 17  },
    { id: "bsb",  name: "Baseball",            gender: "M", rosterLimit: 34,  current: 32  },
    { id: "sb",   name: "Softball",            gender: "W", rosterLimit: 25,  current: 24  },
    { id: "wsoc", name: "Women's Soccer",      gender: "W", rosterLimit: 28,  current: 26  },
    { id: "wrow", name: "Women's Rowing",      gender: "W", rosterLimit: 68,  current: 61  },
    { id: "mtf",  name: "Men's Track & Field", gender: "M", rosterLimit: 45,  current: 40  },
    { id: "wtf",  name: "Women's Track & Field", gender: "W", rosterLimit: 45, current: 43 },
  ],

  titleIX: {
    femaleUndergradPct: 51,
    femaleAthletePct: 47,
    note: "Sample data. Real Title IX analysis requires full participation, aid, and treatment reviews.",
  },

  revenueStreams: [
    { name: "Media Rights",                  annualMillions: 42.0 },
    { name: "Ticket Sales",                  annualMillions: 18.5 },
    { name: "Donations / Development",       annualMillions: 25.0 },
    { name: "Sponsorships",                  annualMillions: 12.0 },
    { name: "NCAA / Conference Distributions", annualMillions: 30.0 },
  ],

  nilDeals: [
    { athlete: "Sample Athlete A", sport: "Football",           brand: "Local Auto Group", valueK: 45, status: "Cleared" },
    { athlete: "Sample Athlete B", sport: "Women's Basketball", brand: "Regional Bank",    valueK: 30, status: "Pending Review" },
  ],

  compliance: [
    { item: "NIL deal over reporting threshold pending clearinghouse review", severity: "medium", area: "NIL" },
    { item: "Women's Rowing several roster spots below limit",                severity: "low",    area: "Roster" },
    { item: "Quarterly Title IX participation report due",                    severity: "high",   area: "Title IX" },
  ],

  events: [
    { name: "Football vs Rival",     date: "2025-11-08", venue: "Main Stadium", status: "On track" },
    { name: "Volleyball Senior Night", date: "2025-11-14", venue: "Arena",      status: "Staffing needed" },
  ],

  facilities: [
    { name: "Main Stadium", issue: "Video board firmware update", status: "Scheduled" },
    { name: "Weight Room",  issue: "2 platforms out for repair",  status: "In progress" },
  ],

  tickets: { seasonSold: 24500, capacity: 30000, singleGameNext: 4200 },

  academics: { teamGPA: 3.14, gradRate: 89, atRiskAthletes: 12 },
};
