import type { Timestamp } from "firebase/firestore";

export function formatMemberSince(createdAt?: Timestamp): string {
  if (!createdAt?.toDate) return "—";
  try {
    return createdAt.toDate().toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function initials(first: string, last: string, fallback: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  if (a && b) return (a + b).toUpperCase();
  if (a) return a.toUpperCase();
  const f = fallback.trim();
  if (f.length >= 2) return f.slice(0, 2).toUpperCase();
  return f.charAt(0).toUpperCase() || "?";
}
