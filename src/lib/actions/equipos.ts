"use server";

import { prisma } from "@/lib/prisma";
import { getDemoOrgId } from "@/lib/demo-org";
import { revalidatePath } from "next/cache";
import { EstadoEquipo, TipoEquipo } from "@/generated/prisma/enums";

// ─── Read ───────────────────────────────────────────────────────

export async function getEquipos() {
  const orgId = await getDemoOrgId();
  return prisma.equipo.findMany({
    where: { orgId },
    include: {
      ubicacion: { select: { nombre: true } },
      empleado: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEquipoById(id: number) {
  const orgId = await getDemoOrgId();
  return prisma.equipo.findFirst({
    where: { id, orgId },
    include: {
      ubicacion: true,
      empleado: true,
      insumos: { include: { insumo: true } },
      tickets: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
}

// ─── Create ─────────────────────────────────────────────────────

export async function createEquipo(data: {
  tipo: TipoEquipo;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  ip?: string;
  hostname?: string;
  macAddress?: string;
  so?: string;
  ram?: string;
  disco?: string;
  procesador?: string;
  estado?: EstadoEquipo;
  notas?: string;
  ubicacionId: number;
  empleadoId?: number;
}) {
  const orgId = await getDemoOrgId();
  const equipo = await prisma.equipo.create({
    data: { ...data, orgId },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/equipos");
  return equipo;
}

// ─── Update ─────────────────────────────────────────────────────

export async function updateEquipo(
  id: number,
  data: {
    tipo?: TipoEquipo;
    marca?: string;
    modelo?: string;
    numeroSerie?: string;
    ip?: string;
    hostname?: string;
    macAddress?: string;
    so?: string;
    ram?: string;
    disco?: string;
    procesador?: string;
    estado?: EstadoEquipo;
    notas?: string;
    ubicacionId?: number;
    empleadoId?: number | null;
  }
) {
  const orgId = await getDemoOrgId();
  // Verify ownership
  const existing = await prisma.equipo.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error("Equipo no encontrado");

  const equipo = await prisma.equipo.update({ where: { id }, data });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/equipos");
  return equipo;
}

// ─── Delete ─────────────────────────────────────────────────────

export async function deleteEquipo(id: number) {
  const orgId = await getDemoOrgId();
  const existing = await prisma.equipo.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error("Equipo no encontrado");

  await prisma.equipo.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/equipos");
}
