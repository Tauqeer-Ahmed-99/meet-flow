// localStorageHelper.ts

export class LocalStorage {
  // Set data to localStorage (auto-stringifies)
  static setItem<T>(key: string, value: T): void {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Get data from localStorage (auto-parses, returns null if not found or invalid)
  static getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }
}
