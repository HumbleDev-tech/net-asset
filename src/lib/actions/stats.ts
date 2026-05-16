"use server";

import { prisma } from "@/lib/prisma";
import { getDemoOrgId } from "@/lib/demo-org";
import { EstadoEquipo, EstadoTicket, Prioridad, TipoEquipo } from "@/generated/prisma/enums";

export async function getDashboardStats() {
  const orgId = await getDemoOrgId();

  const [equipos, insumos, tickets, empleados, ubicaciones] = await Promise.all([
    prisma.equipo.findMany({ where: { orgId }, select: { tipo: true, estado: true } }),
    prisma.insumo.findMany({ where: { orgId }, select: { stockActual: true, stockMinimo: true } }),
    prisma.ticket.findMany({ where: { orgId }, select: { estado: true, prioridad: true } }),
    prisma.empleado.count({ where: { orgId } }),
    prisma.ubicacion.count({ where: { orgId } }),
  ]);

  const totalEquipos = equipos.length;
  const equiposActivos = equipos.filter((e) => e.estado === EstadoEquipo.ACTIVO).length;
  const equiposEnReparacion = equipos.filter((e) => e.estado === EstadoEquipo.EN_REPARACION).length;
  const totalImpresoras = equipos.filter((e) => e.tipo === TipoEquipo.IMPRESORA).length;
  const totalPCs = equipos.filter((e) => e.tipo === TipoEquipo.PC || e.tipo === TipoEquipo.NOTEBOOK).length;

  const insumosAlerta = insumos.filter((i) => i.stockActual <= i.stockMinimo).length;
  const insumosCriticos = insumos.filter((i) => i.stockActual === 0).length;

  const ticketsAbiertos = tickets.filter((t) => t.estado === EstadoTicket.ABIERTO).length;
  const ticketsCriticos = tickets.filter(
    (t) => t.prioridad === Prioridad.CRITICA && t.estado !== EstadoTicket.RESUELTO && t.estado !== EstadoTicket.CERRADO
  ).length;

  return {
    totalEquipos,
    equiposActivos,
    equiposEnReparacion,
    totalImpresoras,
    totalPCs,
    insumosAlerta,
    insumosCriticos,
    ticketsAbiertos,
    ticketsCriticos,
    totalEmpleados: empleados,
    totalUbicaciones: ubicaciones,
  };
}

export async function getRecentEquipos(limit = 6) {
  const orgId = await getDemoOrgId();
  return prisma.equipo.findMany({
    where: { orgId },
    include: {
      ubicacion: { select: { nombre: true } },
      empleado: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAlertInsumos() {
  const orgId = await getDemoOrgId();
  const all = await prisma.insumo.findMany({
    where: { orgId },
    orderBy: { stockActual: "asc" },
  });
  return all.filter((i) => i.stockActual <= i.stockMinimo);
}

export async function getRecentTickets(limit = 4) {
  const orgId = await getDemoOrgId();
  return prisma.ticket.findMany({
    where: { orgId },
    include: {
      empleado: { select: { nombre: true } },
      equipo: { select: { hostname: true, tipo: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
