"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockTickets } from "@/lib/mock-data";
import { EstadoTicket, Prioridad, TipoEquipo } from "@/generated/prisma/enums";

type TicketItem = (typeof mockTickets)[number] & { estado: EstadoTicket };

function prioridadColor(p: Prioridad) {
  switch (p) {
    case Prioridad.CRITICA: return "bg-red-500/15 text-red-400 border-red-500/30";
    case Prioridad.ALTA: return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case Prioridad.MEDIA: return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case Prioridad.BAJA: return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

function estadoColor(e: EstadoTicket) {
  switch (e) {
    case EstadoTicket.ABIERTO: return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case EstadoTicket.EN_PROGRESO: return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case EstadoTicket.RESUELTO: return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case EstadoTicket.CERRADO: return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

function estadoLabel(e: EstadoTicket) {
  switch (e) {
    case EstadoTicket.ABIERTO: return "Abierto";
    case EstadoTicket.EN_PROGRESO: return "En progreso";
    case EstadoTicket.RESUELTO: return "Resuelto";
    case EstadoTicket.CERRADO: return "Cerrado";
  }
}

function tipoEquipoIcon(tipo: TipoEquipo) {
  switch (tipo) {
    case TipoEquipo.PC: return "🖥️";
    case TipoEquipo.NOTEBOOK: return "💻";
    case TipoEquipo.IMPRESORA: return "🖨️";
    case TipoEquipo.MONITOR: return "🖵";
    default: return "📦";
  }
}

function timeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `hace ${days}d`;
  if (hours > 0) return `hace ${hours}h`;
  return "hace un momento";
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>(
    mockTickets.map((t) => ({ ...t }))
  );
  const [filterEstado, setFilterEstado] = useState<string>("todos");

  const filtered = tickets.filter(
    (t) => filterEstado === "todos" || t.estado === filterEstado
  );

  // Sort by priority then date
  const sorted = [...filtered].sort((a, b) => {
    const prioOrder = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3 };
    const prioDiff = prioOrder[a.prioridad] - prioOrder[b.prioridad];
    if (prioDiff !== 0) return prioDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  function changeEstado(ticketId: number, newEstado: EstadoTicket) {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, estado: newEstado } : t
      )
    );
  }

  const openCount = tickets.filter((t) => t.estado === EstadoTicket.ABIERTO).length;
  const progressCount = tickets.filter((t) => t.estado === EstadoTicket.EN_PROGRESO).length;
  const resolvedCount = tickets.filter((t) => t.estado === EstadoTicket.RESUELTO || t.estado === EstadoTicket.CERRADO).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tickets de Soporte</h1>
        <p className="text-muted-foreground mt-1">Mesa de ayuda y gestión de incidentes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 to-cyan-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Abiertos</p>
            <p className="text-2xl font-bold mt-1 text-blue-400">{openCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 to-yellow-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">En Progreso</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">{progressCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-green-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Resueltos</p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-48 h-9 bg-muted/30 border-border/50">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.values(EstadoTicket).map((e) => (
              <SelectItem key={e} value={e}>{estadoLabel(e)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{sorted.length} tickets</span>
      </div>

      {/* Tickets list */}
      <div className="space-y-3">
        {sorted.map((ticket) => (
          <Card key={ticket.id} className="border-border/50 hover:border-border transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Priority indicator */}
                <div className={`w-1 self-stretch rounded-full ${
                  ticket.prioridad === Prioridad.CRITICA ? "bg-red-500" :
                  ticket.prioridad === Prioridad.ALTA ? "bg-orange-500" :
                  ticket.prioridad === Prioridad.MEDIA ? "bg-amber-500" : "bg-slate-500"
                }`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] ${prioridadColor(ticket.prioridad)}`}>
                          {ticket.prioridad}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${estadoColor(ticket.estado)}`}>
                          {estadoLabel(ticket.estado)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                      </div>
                      <h3 className="text-sm font-semibold">{ticket.titulo}</h3>
                      {ticket.descripcion && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {ticket.descripcion}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {timeAgo(ticket.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-semibold">
                          {ticket.usuario.nombre.charAt(0)}
                        </div>
                        {ticket.usuario.nombre}
                      </span>
                      {ticket.equipo && (
                        <span className="flex items-center gap-1">
                          {tipoEquipoIcon(ticket.equipo.tipo)} {ticket.equipo.hostname || "Equipo"}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {ticket.estado === EstadoTicket.ABIERTO && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-border/50 hover:bg-amber-500/10 hover:text-amber-400"
                          onClick={() => changeEstado(ticket.id, EstadoTicket.EN_PROGRESO)}
                        >
                          Tomar
                        </Button>
                      )}
                      {ticket.estado === EstadoTicket.EN_PROGRESO && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-border/50 hover:bg-emerald-500/10 hover:text-emerald-400"
                          onClick={() => changeEstado(ticket.id, EstadoTicket.RESUELTO)}
                        >
                          Resolver
                        </Button>
                      )}
                      {ticket.estado === EstadoTicket.RESUELTO && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-border/50 hover:bg-slate-500/10 hover:text-slate-400"
                          onClick={() => changeEstado(ticket.id, EstadoTicket.CERRADO)}
                        >
                          Cerrar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
