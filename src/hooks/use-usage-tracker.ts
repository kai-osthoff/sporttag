'use client';

import { useEffect, useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEYS = {
  usageSeconds: 'bmc_usage_seconds',
  dismissed: 'bmc_dismissed',
  donated: 'bmc_donated',
  snoozeUntil: 'bmc_snooze_until',
} as const;

const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const TRACK_INTERVAL_MS = 30 * 1000; // Track every 30 seconds

interface UsageTrackerResult {
  shouldShowReminder: boolean;
  dismiss: () => void;
  snooze: () => void;
  markDonated: () => void;
}

function getStorageNumber(key: string, defaultValue: number): number {
  if (typeof window === 'undefined') return defaultValue;
  const value = localStorage.getItem(key);
  return value ? parseInt(value, 10) : defaultValue;
}

function getStorageBoolean(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) === 'true';
}

function checkShouldShowReminder(): boolean {
  if (typeof window === 'undefined') return false;

  const usageSeconds = getStorageNumber(STORAGE_KEYS.usageSeconds, 0);
  const isDismissed = getStorageBoolean(STORAGE_KEYS.dismissed);
  const hasDonated = getStorageBoolean(STORAGE_KEYS.donated);
  const snoozeUntil = getStorageNumber(STORAGE_KEYS.snoozeUntil, 0);

  // Never show if dismissed or donated
  if (isDismissed || hasDonated) {
    return false;
  }

  // Check snooze
  if (snoozeUntil > 0 && Date.now() < snoozeUntil) {
    return false;
  }

  // Show if 2+ hours of usage
  return usageSeconds >= TWO_HOURS_IN_SECONDS;
}

// Store for useSyncExternalStore
let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

function notifyListeners() {
  listeners.forEach(l => l());
}

export function useUsageTracker(): UsageTrackerResult {
  const shouldShowReminder = useSyncExternalStore(
    subscribe,
    checkShouldShowReminder,
    () => false // Server snapshot
  );

  // Track usage time
  useEffect(() => {
    // Track usage every 30 seconds
    const interval = setInterval(() => {
      const currentUsage = getStorageNumber(STORAGE_KEYS.usageSeconds, 0);
      const newUsage = currentUsage + (TRACK_INTERVAL_MS / 1000);
      localStorage.setItem(STORAGE_KEYS.usageSeconds, String(Math.floor(newUsage)));
      notifyListeners();
    }, TRACK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.dismissed, 'true');
    notifyListeners();
  }, []);

  const snooze = useCallback(() => {
    const snoozeUntil = Date.now() + ONE_HOUR_IN_MS;
    localStorage.setItem(STORAGE_KEYS.snoozeUntil, String(snoozeUntil));
    notifyListeners();
  }, []);

  const markDonated = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.donated, 'true');
    notifyListeners();
  }, []);

  return { shouldShowReminder, dismiss, snooze, markDonated };
}
