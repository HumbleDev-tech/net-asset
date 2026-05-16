"use server";

import { prisma } from "@/lib/prisma";
import { getDemoOrgId } from "@/lib/demo-org";
import { revalidatePath } from "next/cache";

// ─── Read ───────────────────────────────────────────────────────

export async function getEmpleados() {
  const orgId = await getDemoOrgId();
  return prisma.empleado.findMany({
    where: { orgId },
    include: {
      ubicacion: { select: { nombre: true } },
      _count: { select: { equipos: true, tickets: true } },
    },
    orderBy: { nombre: "asc" },
  });
}

export async function getEmpleadoById(id: number) {
  const orgId = await getDemoOrgId();
  return prisma.empleado.findFirst({
    where: { id, orgId },
    include: {
      ubicacion: true,
      equipos: { include: { ubicacion: { select: { nombre: true } } } },
      tickets: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

// ─── Create ─────────────────────────────────────────────────────

export async function createEmpleado(data: {
  nombre: string;
  rut?: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
  ubicacionId: number;
}) {
  const orgId = await getDemoOrgId();
  const empleado = await prisma.empleado.create({
    data: { ...data, orgId },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/empleados");
  return empleado;
}

// ─── Update ─────────────────────────────────────────────────────

export async function updateEmpleado(
  id: number,
  data: {
    nombre?: string;
    rut?: string;
    correo?: string;
    telefono?: string;
    cargo?: string;
    ubicacionId?: number;
  }
) {
  const orgId = await getDemoOrgId();
  const existing = await prisma.empleado.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error("Empleado no encontrado");

  const empleado = await prisma.empleado.update({ where: { id }, data });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/empleados");
  return empleado;
}

// ─── Delete ─────────────────────────────────────────────────────

export async function deleteEmpleado(id: number) {
  const orgId = await getDemoOrgId();
  const existing = await prisma.empleado.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error("Empleado no encontrado");

  await prisma.empleado.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/empleados");
}
