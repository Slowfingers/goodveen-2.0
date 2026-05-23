// Minimal fetch wrapper with JWT bearer + JSON helpers.

const TOKEN_KEY = 'goodveen-auth-token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  if (!query) return path;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

export async function apiRequest<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const token = opts.skipAuth ? null : getToken();
  const init: RequestInit = {
    method: opts.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  };
  const res = await fetch(buildUrl(path, opts.query), init);
  if (res.status === 204) return undefined as T;
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message =
      (typeof data === 'object' && data && 'error' in data && typeof data.error === 'string'
        ? (data.error as string)
        : null) ?? res.statusText ?? 'Request failed';
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

export async function apiUpload(
  folder: 'products' | 'events' | 'pages' | 'about' | 'workshop',
  file: File,
): Promise<string> {
  const token = getToken();
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`/api/uploads/${folder}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data?.error ?? 'Upload failed', data);
  }
  const json = (await res.json()) as { url: string };
  return json.url;
}
