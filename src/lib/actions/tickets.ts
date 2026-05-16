"use server";

import { prisma } from "@/lib/prisma";
import { getDemoOrgId } from "@/lib/demo-org";
import { revalidatePath } from "next/cache";
import { EstadoTicket, Prioridad } from "@/generated/prisma/enums";

// ─── Read ───────────────────────────────────────────────────────

export async function getTickets() {
  const orgId = await getDemoOrgId();
  return prisma.ticket.findMany({
    where: { orgId },
    include: {
      empleado: { select: { nombre: true } },
      equipo: { select: { hostname: true, tipo: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Create ─────────────────────────────────────────────────────

export async function createTicket(data: {
  titulo: string;
  descripcion?: string;
  prioridad?: Prioridad;
  empleadoId: number;
  equipoId?: number;
}) {
  const orgId = await getDemoOrgId();
  const ticket = await prisma.ticket.create({
    data: { ...data, orgId },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tickets");
  return ticket;
}

// ─── Update general ─────────────────────────────────────────────

export async function updateTicket(
  id: number,
  data: {
    titulo?: string;
    descripcion?: string;
    prioridad?: Prioridad;
    empleadoId?: number;
    equipoId?: number | null;
  }
) {
  const orgId = await getDemoOrgId();
  const existing = await prisma.ticket.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error("Ticket no encontrado");

  const ticket = await prisma.ticket.update({ where: { id }, data });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tickets");
  return ticket;
}

// ─── Update estado ──────────────────────────────────────────────

export async function updateTicketEstado(id: number, estado: EstadoTicket) {
  const orgId = await getDemoOrgId();
  const existing = await prisma.ticket.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error("Ticket no encontrado");

  const closedAt =
    estado === EstadoTicket.CERRADO || estado === EstadoTicket.RESUELTO
      ? new Date()
      : null;

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { estado, closedAt },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tickets");
  return ticket;
}

// ─── Delete ─────────────────────────────────────────────────────

export async function deleteTicket(id: number) {
  const orgId = await getDemoOrgId();
  const existing = await prisma.ticket.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error("Ticket no encontrado");

  await prisma.ticket.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tickets");
}
