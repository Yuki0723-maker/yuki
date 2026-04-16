import type { AppData } from '../types';

const STORAGE_KEY = 'hoikusha_app_data';

export const defaultData: AppData = {
  children: [],
  renrakucho: [],
  shidoKeikaku: [],
  hoikuNisshi: [],
  kenkouKiroku: [],
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}
