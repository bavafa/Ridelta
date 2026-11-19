export type Zone = { id: number; name: string; borough: string; lon: number; lat: number; rings: number[][][] };
export type Store = { id: string; name: string; cat: string; kind: 'store' | 'mall'; lon: number; lat: number; zone: number };
export type Data = { sources: Record<string, string>; weeks: number; zones: Zone[]; stores: Store[]; trips: Record<string, Record<string, number>> };
export type Inputs = { budget: number; fee: number; credit: number; window: number; radius: number; lift: number };
export type Area = { zone: Zone; miles: number; weeklyTrips: number; rides: number; confirmed: number; extra: number; spend: number; funded: boolean; perDollar: number };

export const DEFAULTS = { who: 'Single store', budget: 8000, fee: 6, credit: 5, window: 15, radius: 2.5, lift: 12 };
/** Default store: the one in the given kind with the most trips arriving in its zone. */
export function defaultStore(d: Data, kind: 'store' | 'mall') {
  const vol = (s: Store) => Object.values(d.trips[String(s.zone)] ?? {}).reduce((a, b) => a + b, 0);
  return d.stores.filter(s => s.kind === kind).reduce<Store | null>((a, b) => (!a || vol(b) > vol(a) ? b : a), null);
}

// Placeholders, listed on the Assumptions page. None of these come from data.
export const CAMPAIGN_WEEKS = 4;
/** Share of rides to the store that would end in a visit with no offer. Malls count any store, so they are higher. */
export const BASE_VISIT = { store: 0.04, mall: 0.08 };
/** Share of visits that check in before the window ends. */
export const completion = (windowMin: number) => 1 - Math.exp(-windowMin / 12);
/** Riders who start closer convert better. Linear from 1 at the store to 0.5 at the edge of the radius. */
export const nearness = (miles: number, radius: number) => 1 - 0.5 * Math.min(miles / radius, 1);

export function miles(aLon: number, aLat: number, bLon: number, bLat: number) {
  const r = (d: number) => (d * Math.PI) / 180, R = 3958.8;
  const h = Math.sin(r(bLat - aLat) / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLon - aLon) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Ranks starting areas by simulated extra visits, then spends the budget down the ranking.
 * The sponsor pays the fee for every confirmed visit, caused or not (D41, D46).
 * Extra visits are the share of confirmed visits that the offer caused: lift x nearness x completion per ride.
 */
export function compute(d: Data, store: Store, i: Inputs) {
  const trips = d.trips[String(store.zone)] ?? {}, c = completion(i.window), base = BASE_VISIT[store.kind];
  const zones = new Map(d.zones.map(z => [z.id, z]));
  const areas: Area[] = [];
  for (const [o, w] of Object.entries(trips)) {
    const zone = zones.get(+o);
    if (!zone) continue;
    const mi = miles(zone.lon, zone.lat, store.lon, store.lat);
    if (mi > i.radius) continue;
    const m = (i.lift / 100) * nearness(mi, i.radius);
    areas.push({ zone, miles: mi, weeklyTrips: w, rides: w * CAMPAIGN_WEEKS, confirmed: w * CAMPAIGN_WEEKS * (base + m) * c, extra: w * CAMPAIGN_WEEKS * m * c, spend: 0, funded: false, perDollar: i.fee > 0 ? m / ((base + m) * i.fee) : 0 });
  }
  // Rank by extra visits per sponsor dollar, so a small close area can beat a large far one. Volume breaks ties.
  areas.sort((a, b) => b.perDollar - a.perDollar || b.weeklyTrips - a.weeklyTrips);
  let left = i.budget, rides = 0, confirmed = 0, extra = 0;
  for (const a of areas) {
    const full = a.confirmed * i.fee, share = full > 0 ? Math.min(1, left / full) : 0;
    if (share <= 0) break;
    a.spend = full * share; a.funded = true; left -= a.spend;
    rides += a.rides * share; confirmed += a.confirmed * share; extra += a.extra * share;
    a.rides *= share; a.confirmed *= share; a.extra *= share;
  }
  const spend = i.budget - left;
  return {
    areas, funded: areas.filter(a => a.funded).length, spend, rides, confirmed, extra,
    extraPerDollar: spend > 0 ? extra / spend : 0,
    platformCost: i.credit * confirmed - spend, // negative means the fees exceed the credit paid out
    feeCoversCredit: i.fee >= i.credit,
  };
}

/**
 * Holdout plan: the best areas are split into matched pairs by volume, one of each pair gets the offer.
 * Smallest detectable change uses two Poisson counts, 80 percent power and a 5 percent two-sided test.
 * Rides to the store's zone stand in for rides to the store door, which no public source gives.
 */
export function holdoutPlan(areas: Area[], pairs = 6) {
  const pool = [...areas].sort((a, b) => b.weeklyTrips - a.weeklyTrips).slice(0, pairs * 2);
  const arm = pool.filter((_, k) => k % 2 === 0).reduce((s, a) => s + a.weeklyTrips, 0);
  const mde = (weeks: number) => 2.8 * Math.sqrt(2 / Math.max(arm * weeks, 1e-9));
  const weeks = [2, 4, 6, 8, 12].find(w => mde(w) <= 0.1) ?? 12;
  return { areasEach: Math.floor(pool.length / 2), weeks, mde: mde(weeks), ridesPerWeek: arm };
}
