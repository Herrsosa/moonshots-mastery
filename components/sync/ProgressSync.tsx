"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { useStore, selectPersistable } from "@/lib/store";

/**
 * Cloud progress sync (no UI). Mounted once in the layout.
 *
 *  - On login: load the user's saved progress from Supabase and hydrate the store.
 *    If they have NO cloud row yet (first login), seed it from whatever local
 *    progress they already had — so anonymous work isn't lost.
 *  - While logged in: debounce-push the persistable slice on every change.
 *  - No-ops entirely when Supabase isn't configured (local-only mode).
 */
const TABLE = "user_progress";
const DEBOUNCE_MS = 1200;

export function ProgressSync() {
  const { user, enabled } = useAuth();
  const readyToPush = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pull (or seed) on login.
  useEffect(() => {
    readyToPush.current = false;
    if (!enabled || !user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select("state")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;

      if (!error && data?.state) {
        // Returning user — cloud is source of truth.
        useStore.getState().hydrateFromCloud(data.state);
      } else if (!error) {
        // First login — push current local progress up as the initial row.
        const snapshot = selectPersistable(useStore.getState());
        await supabase.from(TABLE).upsert({
          user_id: user.id,
          state: snapshot,
          updated_at: new Date().toISOString(),
        });
      }
      readyToPush.current = true;
    })();

    return () => { active = false; };
  }, [user, enabled]);

  // Debounced push on store changes while logged in.
  useEffect(() => {
    if (!enabled || !user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const unsub = useStore.subscribe((state) => {
      if (!readyToPush.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        await supabase.from(TABLE).upsert({
          user_id: user.id,
          state: selectPersistable(state),
          updated_at: new Date().toISOString(),
        });
      }, DEBOUNCE_MS);
    });

    return () => {
      unsub();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [user, enabled]);

  return null;
}
