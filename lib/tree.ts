import type { Branch, NodeStatus } from "./types";

/**
 * Episode-map metadata.
 *
 * After the switch from a tech-tree visual to an episode-map constellation,
 * positional node data (TREE_NODES) and branch-level status helpers
 * (getBranchStatus / getBranchCoverage) are no longer used — status is
 * derived per-mission in TechTree.tsx. Only label + cluster + color helpers
 * remain, which the map and mission pages still rely on.
 */

export const BRANCH_LABEL: Record<Branch, string> = {
  ai: "AI Frontier",
  robotics: "Robotics",
  longevity: "Longevity",
  energy: "Energy",
  space: "Space",
  biotech: "Biotech",
  markets: "Markets",
  abundance: "Abundance Mindset",
};

/**
 * Loose thematic clusters — used purely for the soft constellation outline,
 * NEVER for gating. Same content stays reachable from anywhere.
 */
export const CLUSTERS: { id: string; label: string; members: Branch[] }[] = [
  { id: "frontier", label: "Frontier",      members: ["ai"] },
  { id: "builders", label: "Build & Power", members: ["robotics", "energy"] },
  { id: "bio",      label: "Life & Bio",    members: ["longevity", "biotech"] },
  { id: "reach",    label: "Reach",         members: ["space"] },
  { id: "capital",  label: "Capital",       members: ["markets", "abundance"] },
];

export function statusColor(status: NodeStatus) {
  switch (status) {
    case "mastered":    return "#22C55E";
    case "in_progress": return "#22D3EE";
    case "available":   return "#A855F7";
    default:            return "#52525B";
  }
}
