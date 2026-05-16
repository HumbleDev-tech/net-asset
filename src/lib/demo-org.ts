// ─── Temporary: Demo org context for Phase 1 ───────────────────
// In Phase 2, this will be replaced by real auth + membership lookup.
// For now, all queries use this demo org ID.

import { prisma } from "@/lib/prisma";

/**
 * Gets the demo organization ID.
 * Creates the demo org if it doesn't exist (first run after seed).
 * 
 * TODO: Phase 2 — Replace with real session-based org resolution.
 */
export async function getDemoOrgId(): Promise<string> {
  const org = await prisma.organization.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!org) {
    throw new Error(
      "No organization found. Run `npx prisma db seed` to create demo data."
    );
  }

  return org.id;
}
