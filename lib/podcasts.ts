/**
 * Podcast registry — MoonshotsMastery ships with a single show: Moonshots with
 * Peter Diamandis. The `podcastId` field on every mission is retained so more
 * shows could be layered in later without a schema change, but the product is
 * intentionally focused on one feed for the MVP.
 */
export interface Podcast {
  id: string;
  /** Full name shown in detail surfaces */
  name: string;
  /** Short name shown in filter chips */
  shortName: string;
  host: string;
  /** Brand accent color used for chips and source badges */
  color: string;
  description?: string;
}

export const PODCASTS: Podcast[] = [
  {
    id: "moonshots",
    name: "Moonshots with Peter Diamandis",
    shortName: "Moonshots",
    host: "Peter H. Diamandis",
    color: "#22D3EE",
    description: "Big-picture interviews on AI, longevity, energy, and the abundance future.",
  },
];

export const PODCAST_BY_ID: Record<string, Podcast> = Object.fromEntries(
  PODCASTS.map((p) => [p.id, p])
);

export const ALL_PODCAST_IDS = PODCASTS.map((p) => p.id);
