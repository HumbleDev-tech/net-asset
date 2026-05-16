"use server";

import { prisma } from "@/lib/prisma";
import { getDemoOrgId } from "@/lib/demo-org";
import { revalidatePath } from "next/cache";
import { TipoInsumo, TipoMovimiento } from "@/generated/prisma/enums";

// ─── Read ───────────────────────────────────────────────────────

export async function getInsumos() {
  const orgId = await getDemoOrgId();
  return prisma.insumo.findMany({
    where: { orgId },
    orderBy: [{ stockActual: "asc" }, { modelo: "asc" }],
  });
}

// ─── Create ─────────────────────────────────────────────────────

export async function createInsumo(data: {
  modelo: string;
  tipo: TipoInsumo;
  marca?: string;
  stockActual?: number;
  stockMinimo?: number;
}) {
  const orgId = await getDemoOrgId();
  const insumo = await prisma.insumo.create({
    data: { ...data, orgId },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/insumos");
  return insumo;
}

// ─── Stock movement (instalar / recibir) ────────────────────────

export async function registrarMovimiento(data: {
  insumoId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  nota?: string;
}) {
  const orgId = await getDemoOrgId();

  // Verify insumo belongs to this org
  const insumo = await prisma.insumo.findFirst({
    where: { id: data.insumoId, orgId },
  });
  if (!insumo) throw new Error("Insumo no encontrado");

  // Calculate new stock
  let newStock = insumo.stockActual;
  if (data.tipo === TipoMovimiento.ENTRADA) {
    newStock += data.cantidad;
  } else if (data.tipo === TipoMovimiento.SALIDA) {
    newStock = Math.max(0, newStock - data.cantidad);
  } else {
    // AJUSTE: set to absolute value
    newStock = data.cantidad;
  }

  // Transaction: create movement + update stock
  const [movement] = await prisma.$transaction([
    prisma.movimientoInsumo.create({
      data: {
        insumoId: data.insumoId,
        tipo: data.tipo,
        cantidad: data.cantidad,
        nota: data.nota,
      },
    }),
    prisma.insumo.update({
      where: { id: data.insumoId },
      data: { stockActual: newStock },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/insumos");
  return movement;
}

// ─── Delete ─────────────────────────────────────────────────────

export async function deleteInsumo(id: number) {
  const orgId = await getDemoOrgId();
  const existing = await prisma.insumo.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error("Insumo no encontrado");

  await prisma.insumo.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/insumos");
}
