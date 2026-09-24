'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { findTool, type ToolId } from '@/lib/catalog';
import type { AimDetails } from '@/lib/aim-engine';

export type Result = {
  id: string;
  tool: ToolId;
  value: number;
  unit: string;
  date: string;
  aim?: AimDetails;
};
type GamerData = { favorites: ToolId[]; results: Result[]; reducedMotion: boolean };
const initial: GamerData = { favorites: [], results: [], reducedMotion: false };
const KEY = 'iamgamer.v1';
type GamerContext = GamerData & {
  ready: boolean;
  storageAvailable: boolean;
  toggleFavorite: (id: ToolId) => void;
  addResult: (tool: ToolId, value: number, unit: string, aim?: AimDetails) => void;
  setReducedMotion: (value: boolean) => void;
  clearData: () => void;
};
const Context = createContext<GamerContext | null>(null);

export function GamerProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(initial);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    let loaded = initial;
    let available = true;
    try {
      localStorage.setItem('iamgamer.storage-check', '1');
      localStorage.removeItem('iamgamer.storage-check');
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        loaded = {
          favorites: Array.isArray(parsed.favorites)
            ? [
                ...new Set<ToolId>(
                  parsed.favorites.filter((id: unknown) => typeof id === 'string' && findTool(id)),
                ),
              ]
            : [],
          results: Array.isArray(parsed.results)
            ? parsed.results
                .filter(
                  (r: Result) =>
                    r &&
                    typeof r.id === 'string' &&
                    findTool(r.tool) &&
                    Number.isFinite(r.value) &&
                    typeof r.unit === 'string' &&
                    !Number.isNaN(Date.parse(r.date)),
                )
                .slice(0, 100)
            : [],
          reducedMotion: parsed.reducedMotion === true,
        };
      }
    } catch {
      available = false;
    }
    // Hydrate browser-only preferences after the server-rendered first frame.
    const frame = requestAnimationFrame(() => {
      setData(loaded);
      setReady(true);
      setStorageAvailable(available);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const update = useCallback((fn: (old: GamerData) => GamerData) => {
    setData((old) => fn(old));
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* Keep the session usable when storage is blocked. */
    }
    document.documentElement.dataset.motion = data.reducedMotion ? 'reduced' : 'full';
  }, [data, ready]);
  const addResult = useCallback(
    (tool: ToolId, value: number, unit: string, aim?: AimDetails) => {
      const result = {
        id: crypto.randomUUID(),
        tool,
        value,
        unit,
        date: new Date().toISOString(),
        ...(aim ? { aim } : {}),
      };
      update((old) => ({ ...old, results: [result, ...old.results].slice(0, 100) }));
    },
    [update],
  );
  return (
    <Context.Provider
      value={{
        ...data,
        ready,
        storageAvailable,
        toggleFavorite: (id) =>
          update((old) => ({
            ...old,
            favorites: old.favorites.includes(id)
              ? old.favorites.filter((item) => item !== id)
              : [...old.favorites, id],
          })),
        addResult,
        setReducedMotion: (value) => update((old) => ({ ...old, reducedMotion: value })),
        clearData: () => update(() => initial),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useGamer() {
  const context = useContext(Context);
  if (!context) throw new Error('GamerProvider is required');
  return context;
}
