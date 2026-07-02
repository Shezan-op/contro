"use client";

export const AUTH_PROFILE_KEY = "contro_auth:v1";

export interface StoredAuthProfile {
  email: string;
  name: string;
  passwordHash: string;
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function readAuthProfile(): StoredAuthProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAuthProfile>;
    if (!parsed.email || !parsed.name || !parsed.passwordHash) return null;
    return {
      email: parsed.email,
      name: parsed.name,
      passwordHash: parsed.passwordHash,
    };
  } catch {
    return null;
  }
}

export function saveAuthProfile(profile: StoredAuthProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
}

export async function setLocalSession() {
  await fetch("/api/local-session", { method: "POST" });
}

export async function clearLocalSession() {
  await fetch("/api/local-session", { method: "DELETE" });
}
