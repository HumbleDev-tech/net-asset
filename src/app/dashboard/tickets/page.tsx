"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTickets, updateTicketEstado } from "@/lib/actions/tickets";
import { EstadoTicket, Prioridad } from "@/generated/prisma/enums";
import { prioridadColor, estadoTicketColor, estadoTicketLabel, tipoEquipoIcon, prioridadBarColor, timeAgo } from "@/lib/helpers";

type TicketItem = Awaited<ReturnType<typeof getTickets>>[number];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const data = await getTickets();
      setTickets(data);
    });
  };

  useEffect(() => { loadData(); }, []);

  const filtered = tickets.filter((t) => filterEstado === "todos" || t.estado === filterEstado);
  const sorted = [...filtered].sort((a, b) => {
    const prioOrder: Record<string, number> = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3 };
    const prioDiff = (prioOrder[a.prioridad] ?? 4) - (prioOrder[b.prioridad] ?? 4);
    if (prioDiff !== 0) return prioDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  async function changeEstado(ticketId: number, newEstado: EstadoTicket) {
    await updateTicketEstado(ticketId, newEstado);
    loadData();
  }

  const openCount = tickets.filter((t) => t.estado === EstadoTicket.ABIERTO).length;
  const progressCount = tickets.filter((t) => t.estado === EstadoTicket.EN_PROGRESO).length;
  const resolvedCount = tickets.filter((t) => t.estado === EstadoTicket.RESUELTO || t.estado === EstadoTicket.CERRADO).length;

  if (isPending && tickets.length === 0) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Tickets de Soporte</h1>
        <p className="text-muted-foreground mt-1">Cargando...</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tickets de Soporte</h1>
        <p className="text-muted-foreground mt-1">Mesa de ayuda y gestión de incidentes</p>
      </div>

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

      <div className="flex items-center gap-3">
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-48 h-9 bg-muted/30 border-border/50"><SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.values(EstadoTicket).map((e) => <SelectItem key={e} value={e}>{estadoTicketLabel(e)}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{sorted.length} tickets</span>
      </div>

      <div className="space-y-3">
        {sorted.map((ticket) => (
          <Card key={ticket.id} className="border-border/50 hover:border-border transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-1 self-stretch rounded-full ${prioridadBarColor(ticket.prioridad)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] ${prioridadColor(ticket.prioridad)}`}>{ticket.prioridad}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${estadoTicketColor(ticket.estado)}`}>{estadoTicketLabel(ticket.estado)}</Badge>
                        <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                      </div>
                      <h3 className="text-sm font-semibold">{ticket.titulo}</h3>
                      {ticket.descripcion && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.descripcion}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{timeAgo(new Date(ticket.createdAt))}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-semibold">{ticket.empleado.nombre.charAt(0)}</div>
                        {ticket.empleado.nombre}
                      </span>
                      {ticket.equipo && (
                        <span className="flex items-center gap-1">
                          {tipoEquipoIcon(ticket.equipo.tipo)} {ticket.equipo.hostname || "Equipo"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {ticket.estado === EstadoTicket.ABIERTO && (
                        <Button variant="outline" size="sm" className="h-7 text-xs border-border/50 hover:bg-amber-500/10 hover:text-amber-400" onClick={() => changeEstado(ticket.id, EstadoTicket.EN_PROGRESO)}>Tomar</Button>
                      )}
                      {ticket.estado === EstadoTicket.EN_PROGRESO && (
                        <Button variant="outline" size="sm" className="h-7 text-xs border-border/50 hover:bg-emerald-500/10 hover:text-emerald-400" onClick={() => changeEstado(ticket.id, EstadoTicket.RESUELTO)}>Resolver</Button>
                      )}
                      {ticket.estado === EstadoTicket.RESUELTO && (
                        <Button variant="outline" size="sm" className="h-7 text-xs border-border/50 hover:bg-slate-500/10 hover:text-slate-400" onClick={() => changeEstado(ticket.id, EstadoTicket.CERRADO)}>Cerrar</Button>
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
