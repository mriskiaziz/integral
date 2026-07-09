import { cookies, headers } from "next/headers";

function getBaseUrl() {
  const headerList = headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol =
    headerList.get("x-forwarded-proto") || (host?.startsWith("localhost") ? "http" : "https");

  if (host) return `${protocol}://${host}`;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}

function getCookieHeader() {
  return cookies()
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

function createUrl(path) {
  return path.startsWith("http") ? path : `${getBaseUrl()}${path}`;
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const cookieHeader = getCookieHeader();
  const response = await fetch(createUrl(path), {
    cache: "no-store",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...options.headers,
    },
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new Error(payload?.error || `Request API gagal: ${response.status} ${path}`);
  }

  return payload?.data ?? payload;
}

export function apiGet(path) {
  return apiFetch(path);
}

export function apiPost(path, data) {
  return apiFetch(path, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiPut(path, data) {
  return apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function apiDelete(path) {
  return apiFetch(path, {
    method: "DELETE",
  });
}
