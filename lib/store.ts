"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserState, MissionAttempt } from "./types";
import { scheduleReview } from "./review";

interface Store extends UserState {
  completeMission: (
    missionId: string,
    payload: {
      score: number;
      weakConcepts: string[];
      perQuestion: MissionAttempt["perQuestion"];
      xp: number;
      badge: string;
    }
  ) => void;
  hydrated: boolean;
  _markHydrated: () => void;
  resetProgress: () => void;
  /** Replace the user-state slice with a snapshot loaded from the cloud (Supabase). */
  hydrateFromCloud: (snapshot: Partial<UserState>) => void;
}

/** The persistable slice synced to the cloud — excludes transient flags + actions. */
export function selectPersistable(s: UserState): UserState {
  return {
    level: s.level,
    xp: s.xp,
    xpToNext: s.xpToNext,
    streak: s.streak,
    lastActive: s.lastActive,
    missions: s.missions,
    badges: s.badges,
  };
}

// Clean slate. Every new account (and every fresh browser) starts at zero —
// no seeded demo progress. Level 1, no XP, no mastered episodes. This is the
// correct baseline for a real multi-user app: progress is earned, not gifted.
const INITIAL_USER_STATE: UserState = {
  level: 1,
  xp: 0,
  xpToNext: 1000,
  streak: 0,
  lastActive: new Date().toISOString(),
  missions: {},
  badges: [],
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...INITIAL_USER_STATE,
      hydrated: false,
      _markHydrated: () => set({ hydrated: true }),
      resetProgress: () => set({ ...INITIAL_USER_STATE, hydrated: true }),
      hydrateFromCloud: (snapshot) =>
        set((s) => ({
          level: snapshot.level ?? s.level,
          xp: snapshot.xp ?? s.xp,
          xpToNext: snapshot.xpToNext ?? s.xpToNext,
          streak: snapshot.streak ?? s.streak,
          lastActive: snapshot.lastActive ?? s.lastActive,
          missions: snapshot.missions ?? s.missions,
          badges: snapshot.badges ?? s.badges,
          hydrated: true,
        })),

      completeMission: (id, p) =>
        set((s) => {
          const prev = s.missions[id];
          // Never lower the recorded best score on a re-take
          const bestScore = Math.max(prev?.score ?? 0, p.score);
          const isImprovement = p.score > (prev?.score ?? -1);
          // XP only awarded for improvement (or first completion)
          const xpAfter = s.xp + (isImprovement ? p.xp : 0);
          const level = xpAfter >= s.xpToNext ? s.level + 1 : s.level;
          const xpToNext = xpAfter >= s.xpToNext ? s.xpToNext + 8000 : s.xpToNext;

          // Schedule the next spaced-repetition review off THIS attempt's score
          // (not the best-ever), so a weak re-take correctly shortens the interval.
          const { reviewStage, reviewDue } = scheduleReview(prev?.reviewStage, p.score);

          return {
            xp: xpAfter,
            level,
            xpToNext,
            missions: {
              ...s.missions,
              [id]: {
                score: bestScore,
                weakConcepts: p.weakConcepts,
                perQuestion: p.perQuestion,
                attempts: (prev?.attempts ?? 0) + 1,
                completedAt: new Date().toISOString(),
                reviewStage,
                reviewDue,
              },
            },
            badges:
              p.score >= 80 && !s.badges.includes(p.badge) ? [...s.badges, p.badge] : s.badges,
            lastActive: new Date().toISOString(),
          };
        }),
    }),
    {
      name: "moonshots-mastery-v5",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as never))),
      onRehydrateStorage: () => (state) => state?._markHydrated(),
    }
  )
);
