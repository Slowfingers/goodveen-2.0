// Helpers for JSON-encoded String[] columns in SQLite.

export function encodeArr(value: unknown): string {
  if (!value) return '[]';
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? value : '[]';
    } catch {
      return '[]';
    }
  }
  return '[]';
}

export function decodeArr(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
