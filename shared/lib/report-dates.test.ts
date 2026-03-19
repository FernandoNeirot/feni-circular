import { normalizeReportDateKey } from "./report-dates";

describe("normalizeReportDateKey", () => {
  it("parses yyyy-MM-dd strings", () => {
    expect(normalizeReportDateKey("2026-03-10")).toBe("2026-03-10");
    expect(normalizeReportDateKey("2026-03-10T15:00:00.000Z")).toBe("2026-03-10");
  });

  it("parses Firestore Timestamp JSON shape", () => {
    const seconds = Math.floor(Date.UTC(2026, 2, 15) / 1000);
    expect(normalizeReportDateKey({ seconds, nanoseconds: 0 })).toBe("2026-03-15");
    expect(normalizeReportDateKey({ _seconds: seconds, _nanoseconds: 0 })).toBe("2026-03-15");
  });

  it("returns null for empty or unknown", () => {
    expect(normalizeReportDateKey("")).toBeNull();
    expect(normalizeReportDateKey(null)).toBeNull();
    expect(normalizeReportDateKey(undefined)).toBeNull();
    expect(normalizeReportDateKey({})).toBeNull();
  });
});
