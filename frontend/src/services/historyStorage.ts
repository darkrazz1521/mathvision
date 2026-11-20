import { HistoryEntry } from '../types/history';

const STORAGE_KEY = 'mathvision_history_v1';
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load history from localStorage:', e);
    return [];
  }
}

export function saveHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>
): HistoryEntry {
  try {
    const current = getHistory();
    const newEntry: HistoryEntry = {
      ...entry,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      isFavorite: false,
    };

    // Keep at most MAX_ENTRIES, prioritizing favorites
    const updated = [newEntry, ...current].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (e) {
    console.error('Failed to save history entry:', e);
    return {
      ...entry,
      id: `hist_${Date.now()}`,
      timestamp: Date.now(),
      isFavorite: false,
    };
  }
}

export function deleteHistoryEntry(id: string): void {
  try {
    const current = getHistory();
    const filtered = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete history entry:', e);
  }
}

export function toggleFavorite(id: string): void {
  try {
    const current = getHistory();
    const updated = current.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to toggle favorite:', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}

export function exportHistoryJson(): string {
  const list = getHistory();
  return JSON.stringify(list, null, 2);
}

export function importHistoryJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.slice(0, MAX_ENTRIES)));
    return true;
  } catch (e) {
    console.error('Failed to import history JSON:', e);
    return false;
  }
}
