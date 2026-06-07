// Sponsorship placement pricing (rupees per 30-day month).
export const SPONSOR_MONTHLY = {
  EVERYWHERE: 2000, // top placement on /labs + every relevant test page
  DIRECTORY: 800, // top of the /labs directory
  TEST: 400, // a single test page
  TEST_BUNDLE: 300, // per test when bundling 3+ tests
};

export const SPONSOR_MONTHS = [1, 3, 6];

export const SCOPES = ["EVERYWHERE", "DIRECTORY", "TESTS"] as const;
export type SponsorScope = (typeof SCOPES)[number];

// Returns the price in rupees.
export function sponsorPrice(opts: {
  scope: string;
  testCount: number;
  months: number;
}): number {
  const months = SPONSOR_MONTHS.includes(opts.months) ? opts.months : 1;
  if (opts.scope === "EVERYWHERE") return SPONSOR_MONTHLY.EVERYWHERE * months;
  if (opts.scope === "DIRECTORY") return SPONSOR_MONTHLY.DIRECTORY * months;
  // TESTS — per-test, with a bundle discount for 3+ tests.
  const n = Math.max(1, opts.testCount);
  const per = n >= 3 ? SPONSOR_MONTHLY.TEST_BUNDLE : SPONSOR_MONTHLY.TEST;
  return per * n * months;
}
