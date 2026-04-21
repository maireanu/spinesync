import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseSets,
  computeStreak,
  buildSessionPattern,
  getExerciseById,
  todayISO,
  localDateISO,
} from "./helpers.js";

// ─── parseSets ────────────────────────────────────────────────────────────────
describe("parseSets", () => {
  it("parses '3×12 reps' → 3", () => expect(parseSets("3×12 reps")).toBe(3));
  it("parses '2x10' → 2", () => expect(parseSets("2x10")).toBe(2));
  it("returns 1 for non-set strings like '8–10 breaths'", () => expect(parseSets("8–10 breaths")).toBe(1));
  it("returns 1 for empty string", () => expect(parseSets("")).toBe(1));
  it("handles '10/side'", () => expect(parseSets("10/side")).toBe(1));
});

// ─── todayISO / localDateISO ─────────────────────────────────────────────────
describe("todayISO", () => {
  it("returns a valid YYYY-MM-DD string", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("localDateISO", () => {
  it("returns today with offset 0", () => {
    expect(localDateISO(0)).toBe(todayISO());
  });

  it("returns a date in the future for positive offsets", () => {
    const today = new Date(todayISO() + "T12:00:00");
    const tomorrow = new Date(localDateISO(1) + "T12:00:00");
    expect(tomorrow.getTime() - today.getTime()).toBe(86400000);
  });

  it("returns a date in the past for negative offsets", () => {
    const today = new Date(todayISO() + "T12:00:00");
    const yesterday = new Date(localDateISO(-1) + "T12:00:00");
    expect(today.getTime() - yesterday.getTime()).toBe(86400000);
  });
});

// ─── computeStreak ────────────────────────────────────────────────────────────
describe("computeStreak", () => {
  it("returns 0 for empty log", () => expect(computeStreak([])).toBe(0));
  it("returns 0 for null log", () => expect(computeStreak(null)).toBe(0));

  it("counts consecutive days ending today", () => {
    const log = [
      { date: localDateISO(0) },
      { date: localDateISO(-1) },
      { date: localDateISO(-2) },
    ];
    expect(computeStreak(log)).toBe(3);
  });

  it("stops at gap", () => {
    const log = [
      { date: localDateISO(0) },
      // gap: -1 missing
      { date: localDateISO(-2) },
    ];
    expect(computeStreak(log)).toBe(1);
  });

  it("includes today-only streak of 1", () => {
    const log = [{ date: localDateISO(0) }];
    expect(computeStreak(log)).toBe(1);
  });

  it("does not count a future entry", () => {
    const log = [{ date: localDateISO(1) }]; // tomorrow
    expect(computeStreak(log)).toBe(0);
  });
});

// ─── buildSessionPattern ─────────────────────────────────────────────────────
describe("buildSessionPattern", () => {
  it("returns empty array for empty schedule", () => {
    expect(buildSessionPattern({})).toEqual([]);
  });

  it("preserves DAYS order (Mon before Tue)", () => {
    const schedule = {
      Tue: [{ id: "g1", name: "G1", exercises: [] }],
      Mon: [{ id: "g2", name: "G2", exercises: [] }],
    };
    const pattern = buildSessionPattern(schedule);
    expect(pattern[0].dayKey).toBe("Mon");
    expect(pattern[1].dayKey).toBe("Tue");
  });

  it("skips empty days", () => {
    const schedule = {
      Mon: [],
      Tue: [{ id: "g1", name: "G1", exercises: [] }],
    };
    const pattern = buildSessionPattern(schedule);
    expect(pattern.length).toBe(1);
    expect(pattern[0].dayKey).toBe("Tue");
  });

  it("attaches correct dayLabel", () => {
    const schedule = {
      Mon: [{ id: "g1", name: "G1", exercises: [] }],
    };
    expect(buildSessionPattern(schedule)[0].dayLabel).toBe("Monday");
  });
});

// ─── getExerciseById ─────────────────────────────────────────────────────────
describe("getExerciseById", () => {
  const exercises = {
    muscle: [{ id: "m1", name: "Curl" }],
    cardio: [{ id: "c1", name: "Run" }],
  };

  it("finds an exercise by id", () => {
    expect(getExerciseById(exercises, "c1")).toEqual({ id: "c1", name: "Run" });
  });

  it("returns null for unknown id", () => {
    expect(getExerciseById(exercises, "x99")).toBeNull();
  });
});
