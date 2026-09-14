import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sampleData } from "../data/sampleData.js";
import {
  asksForRecommendations,
  formatRecommendations,
  getRecommendations,
} from "./recommendations.js";
import { cabinet, middleManagement } from "./agents.js";
import { rosterGaps } from "./insights.js";

const allAgents = [...cabinet, ...middleManagement];

const withRowingAdd = (d) => ({
  ...d,
  sports: d.sports.map((s) =>
    s.id === "wrow" ? { ...s, current: s.current + 1 } : s
  ),
  revenueShare: {
    ...d.revenueShare,
    committedMillions: +(d.revenueShare.committedMillions + 0.15).toFixed(2),
  },
});

describe("getRecommendations", () => {
  it("returns ranked recs for every cabinet and ops agent", () => {
    for (const agent of allAgents) {
      const recs = getRecommendations(agent.id, sampleData);
      assert.ok(recs.length > 0, `${agent.id} should have recommendations`);
      const ranks = { high: 0, medium: 1, low: 2 };
      for (let i = 1; i < recs.length; i++) {
        assert.ok(
          ranks[recs[i - 1].priority] <= ranks[recs[i].priority],
          `${agent.id} recs should be sorted by priority`
        );
      }
    }
  });

  it("has the Athletic Director pull high-priority cabinet items", () => {
    const recs = getRecommendations("ad", sampleData);
    const text = recs.map((r) => r.title + " " + r.detail).join(" | ");
    assert.ok(/Title IX/i.test(text), "AD should surface Title IX");
    assert.ok(
      recs.some((r) => r.priority === "high"),
      "AD digest should include high-priority items"
    );
    assert.ok(recs.length <= 5, "AD digest stays short");
  });

  it("has the GM recommend Women's Rowing as the largest open gap", () => {
    const recs = getRecommendations("gm", sampleData);
    const top = recs[0];
    assert.match(top.title, /Women's Rowing/);
    assert.match(top.title, /7 open/);
    assert.equal(rosterGaps(sampleData)[0].id, "wrow");
  });

  it("updates GM and cap recs after a Women's Rowing add", () => {
    const after = withRowingAdd(sampleData);
    const gm = getRecommendations("gm", after)[0];
    assert.match(gm.title, /Women's Rowing/);
    assert.match(gm.title, /6 open/);

    const cfo = getRecommendations("cfo", after);
    const cap = cfo.find((r) => r.id === "cfo-cap");
    assert.ok(cap);
    assert.match(cap.title, /\$2\.5M/);
  });

  it("flags an over-limit sport as a high compliance miss", () => {
    const over = {
      ...sampleData,
      sports: sampleData.sports.map((s) =>
        s.id === "mbb" ? { ...s, current: s.rosterLimit + 2 } : s
      ),
    };
    const recs = getRecommendations("compliance", over);
    const hit = recs.find((r) => r.id === "comp-over-mbb");
    assert.ok(hit);
    assert.equal(hit.priority, "high");
    assert.match(hit.title, /Men's Basketball/);
  });

  it("tells marketing to hold uncleared NIL campaigns", () => {
    const recs = getRecommendations("cmo", sampleData);
    const hold = recs.find((r) => r.id === "cmo-nil-hold");
    assert.ok(hold);
    assert.match(hold.title, /Sample Athlete B/);
  });
});

describe("chat routing", () => {
  it("treats empty, brief, and recommend prompts as recommendation asks", () => {
    assert.equal(asksForRecommendations(""), true);
    assert.equal(asksForRecommendations("recommend"), true);
    assert.equal(asksForRecommendations("what should I do"), true);
    assert.equal(asksForRecommendations("brief"), true);
    assert.equal(asksForRecommendations("budget status"), false);
  });

  it("has the AD still answer budget and alert keywords", () => {
    const ad = cabinet.find((a) => a.id === "ad");
    const budget = ad.respond("budget status", sampleData);
    assert.match(budget, /committed/);
    const alerts = ad.respond("compliance alerts", sampleData);
    assert.match(alerts, /Title IX/);
    const recs = ad.respond("what should I do", sampleData);
    assert.match(recs, /\[HIGH\]/);
  });

  it("formats recs as a numbered briefing", () => {
    const text = formatRecommendations(
      getRecommendations("coo", sampleData)
    );
    assert.match(text, /1\. \[HIGH\] Staff Volleyball Senior Night/);
  });
});
