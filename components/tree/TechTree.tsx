"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { EpisodeStar } from "./EpisodeStar";
import { CLUSTERS } from "@/lib/tree";
import { useStore } from "@/lib/store";
import { ALL_MISSIONS } from "@/content/missions";
import { PODCAST_BY_ID } from "@/lib/podcasts";
import type { Mission, NodeStatus } from "@/lib/types";

/**
 * Mission Map.
 *
 * Episodes are the nodes — each star is a clickable episode with title + date.
 * Episodes group into 5 thematic clusters laid out as responsive cards.
 * Within a cluster, episodes flex-wrap chronologically (newest first).
 *
 * Previous layout used absolute-positioned tiles inside a fixed-height SVG
 * canvas — which clipped overflow rows (truncation) and caused tile-label
 * overlap that intercepted clicks on neighboring stars. This version flows
 * everything naturally so clicks always land and content is never truncated.
 */

/** Per-cluster teaser shown when there are no episodes yet — signals the roadmap. */
const CLUSTER_TEASER: Record<string, string> = {
  frontier: "Sequoia Crucible, Latent Space, No Priors — landing soon.",
  builders: "Hard Tech founders, Cognitive Revolution robotics specials.",
  bio:      "Peter Attia, Huberman crossovers, longevity deep-dives.",
  reach:    "Eric Berger's Ars Technica space stack, Acquired SpaceX series.",
  capital:  "Acquired, All-In, 20VC — markets & abundance threads.",
};

const CLUSTER_COLORS: Record<string, string> = {
  frontier: "#A855F7",
  builders: "#22D3EE",
  bio:      "#22C55E",
  reach:    "#F59E0B",
  capital:  "#6366F1",
};

function statusForMission(missionId: string, attempts: Record<string, { score: number }>): NodeStatus {
  const a = attempts[missionId];
  if (!a) return "available";
  return a.score >= 80 ? "mastered" : "in_progress";
}

export function TechTree({ podcastFilter = "all" }: { podcastFilter?: "all" | string }) {
  const router = useRouter();
  const missions = useStore((s) => s.missions);

  const episodesByCluster = useMemo(() => {
    const filtered = podcastFilter === "all"
      ? ALL_MISSIONS
      : ALL_MISSIONS.filter((m) => m.podcastId === podcastFilter);
    const out: Record<string, Mission[]> = {};
    for (const cluster of CLUSTERS) {
      const inCluster = filtered
        .filter((m) => cluster.members.includes(m.branch))
        .sort((a, b) => b.releasedDate.localeCompare(a.releasedDate));
      out[cluster.id] = inCluster;
    }
    return out;
  }, [podcastFilter]);

  const onClickEpisode = (m: Mission) => router.push(`/mission/${m.id}`);

  return (
    <div className="relative w-full grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {CLUSTERS.map((cluster, clusterIdx) => {
        const eps = episodesByCluster[cluster.id] ?? [];
        const color = CLUSTER_COLORS[cluster.id] ?? "#22D3EE";
        return (
          <motion.section
            key={cluster.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: clusterIdx * 0.08 }}
            className="relative panel-soft rounded-2xl p-5 overflow-hidden flex flex-col"
            style={{
              boxShadow: `inset 0 0 0 1px ${color}1a`,
              minHeight: 220,
            }}
          >
            {/* Soft cluster-color glow — purely decorative, behind content */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 30% 0%, ${color}26, transparent 55%)`,
                filter: "blur(18px)",
              }}
              aria-hidden
            />

            {/* Header */}
            <div className="relative flex items-start justify-between mb-4">
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.22em] font-bold"
                  style={{ color: `${color}E0`, textShadow: `0 0 10px ${color}55` }}
                >
                  {cluster.label}
                </div>
                <div className="text-[10px] text-ink-faint mt-0.5 font-mono">
                  {eps.length === 0
                    ? "Awaiting content"
                    : `${eps.length} episode${eps.length === 1 ? "" : "s"}`}
                </div>
              </div>
              <div
                className="size-2 rounded-full mt-1"
                style={{ background: color, boxShadow: `0 0 10px ${color}` }}
              />
            </div>

            {/* Body */}
            {eps.length === 0 ? (
              <div className="relative flex-1 grid place-items-center min-h-[140px] text-center px-4">
                <div>
                  <div className="text-[11px] text-ink-faint italic mb-1">More episodes coming</div>
                  <div className="text-[10px] text-ink-faint/70">
                    {CLUSTER_TEASER[cluster.id] ?? "New episodes will appear here as transcripts land."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-wrap items-start gap-x-2 gap-y-5 justify-center pt-1">
                {eps.map((m, i) => {
                  const podcast = PODCAST_BY_ID[m.podcastId];
                  const status = statusForMission(m.id, missions);
                  return (
                    <EpisodeStar
                      key={m.id}
                      mission={m}
                      status={status}
                      podcast={podcast}
                      onClick={() => onClickEpisode(m)}
                      delay={0.05 + i * 0.04}
                    />
                  );
                })}
              </div>
            )}
          </motion.section>
        );
      })}
    </div>
  );
}
