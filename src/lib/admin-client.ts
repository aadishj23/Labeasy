// Client-side admin token helpers. The token lives in sessionStorage so it is
// per-tab and cleared automatically when the tab is closed.
const KEY = "admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(KEY);
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(KEY);
}

/** fetch wrapper that attaches the admin Bearer token. */
export async function adminFetch(url: string, opts: RequestInit = {}) {
  const token = getAdminToken();
  return fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
