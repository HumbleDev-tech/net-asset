// ─── Shared helpers used across all pages ───────────────────────
// Extracted to avoid duplication (was repeated in every page file)

import {
  EstadoEquipo,
  EstadoTicket,
  TipoEquipo,
  TipoInsumo,
  Prioridad,
} from "@/generated/prisma/enums";

// ─── Equipment helpers ──────────────────────────────────────────

export function estadoEquipoColor(estado: EstadoEquipo) {
  switch (estado) {
    case EstadoEquipo.ACTIVO:
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case EstadoEquipo.EN_REPARACION:
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case EstadoEquipo.DADO_DE_BAJA:
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case EstadoEquipo.EN_BODEGA:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    case EstadoEquipo.PRESTADO:
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  }
}

export function tipoEquipoIcon(tipo: TipoEquipo) {
  switch (tipo) {
    case TipoEquipo.PC: return "🖥️";
    case TipoEquipo.NOTEBOOK: return "💻";
    case TipoEquipo.IMPRESORA: return "🖨️";
    case TipoEquipo.MONITOR: return "🖵";
    case TipoEquipo.TELEFONO: return "📞";
    case TipoEquipo.SERVIDOR: return "🗄️";
    case TipoEquipo.SWITCH: return "🔌";
    case TipoEquipo.ROUTER: return "📡";
    case TipoEquipo.TABLET: return "📱";
    default: return "📦";
  }
}

export function estadoEquipoLabel(estado: EstadoEquipo) {
  return estado.replace(/_/g, " ");
}

// ─── Ticket helpers ─────────────────────────────────────────────

export function prioridadColor(p: Prioridad) {
  switch (p) {
    case Prioridad.CRITICA:
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case Prioridad.ALTA:
      return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case Prioridad.MEDIA:
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case Prioridad.BAJA:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

export function estadoTicketColor(e: EstadoTicket) {
  switch (e) {
    case EstadoTicket.ABIERTO:
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case EstadoTicket.EN_PROGRESO:
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case EstadoTicket.RESUELTO:
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case EstadoTicket.CERRADO:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

export function estadoTicketLabel(e: EstadoTicket) {
  switch (e) {
    case EstadoTicket.ABIERTO: return "Abierto";
    case EstadoTicket.EN_PROGRESO: return "En progreso";
    case EstadoTicket.RESUELTO: return "Resuelto";
    case EstadoTicket.CERRADO: return "Cerrado";
  }
}

export function prioridadBarColor(p: Prioridad) {
  switch (p) {
    case Prioridad.CRITICA: return "bg-red-500";
    case Prioridad.ALTA: return "bg-orange-500";
    case Prioridad.MEDIA: return "bg-amber-500";
    case Prioridad.BAJA: return "bg-slate-500";
  }
}

// ─── Insumo helpers ─────────────────────────────────────────────

export function tipoInsumoLabel(tipo: TipoInsumo) {
  switch (tipo) {
    case TipoInsumo.TONER: return "Tóner";
    case TipoInsumo.TINTA: return "Tinta";
    case TipoInsumo.DRUM: return "Drum";
    case TipoInsumo.CABLE: return "Cable";
    default: return "Otro";
  }
}

export function stockStatus(actual: number, minimo: number) {
  if (actual === 0)
    return {
      label: "Sin stock",
      class: "bg-red-500/15 text-red-400 border-red-500/30",
      barColor: "bg-red-500",
    };
  if (actual <= minimo)
    return {
      label: "Bajo",
      class: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      barColor: "bg-amber-500",
    };
  return {
    label: "OK",
    class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    barColor: "bg-emerald-500",
  };
}

// ─── Time helpers ───────────────────────────────────────────────

export function timeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `hace ${days}d`;
  if (hours > 0) return `hace ${hours}h`;
  return "hace un momento";
}
