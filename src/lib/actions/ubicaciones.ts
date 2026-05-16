"use server";

import { prisma } from "@/lib/prisma";
import { getDemoOrgId } from "@/lib/demo-org";
import { revalidatePath } from "next/cache";

// ─── Read ───────────────────────────────────────────────────────

export async function getUbicaciones() {
  const orgId = await getDemoOrgId();
  return prisma.ubicacion.findMany({
    where: { orgId },
    include: {
      _count: { select: { empleados: true, equipos: true } },
    },
    orderBy: { nombre: "asc" },
  });
}

// ─── Create ─────────────────────────────────────────────────────

export async function createUbicacion(nombre: string) {
  const orgId = await getDemoOrgId();
  const ubicacion = await prisma.ubicacion.create({
    data: { nombre, orgId },
  });
  revalidatePath("/dashboard");
  return ubicacion;
}

// ─── Delete ─────────────────────────────────────────────────────

export async function deleteUbicacion(id: number) {
  const orgId = await getDemoOrgId();
  const existing = await prisma.ubicacion.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error("Ubicación no encontrada");

  await prisma.ubicacion.delete({ where: { id } });
  revalidatePath("/dashboard");
}
