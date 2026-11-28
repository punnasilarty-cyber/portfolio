"use client";

import { useSyncExternalStore } from "react";
import { defaultSite, type Site } from "@/site";

// one copy of the editable content for the whole page
let current = defaultSite;
const listeners = new Set<() => void>();

export function setSite(next: Site) {
  current = next;
  listeners.forEach((changed) => changed());
}

const subscribe = (changed: () => void) => {
  listeners.add(changed);
  return () => {
    listeners.delete(changed);
  };
};

export const useSite = () => useSyncExternalStore(subscribe, () => current, () => defaultSite);
