import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStats, mockEquipos, mockInsumos, mockTickets } from "@/lib/mock-data";
import { EstadoEquipo, TipoEquipo, EstadoTicket, Prioridad } from "@/generated/prisma/enums";

// ─── Helpers ────────────────────────────────────────────────────
function estadoColor(estado: EstadoEquipo) {
  switch (estado) {
    case EstadoEquipo.ACTIVO: return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case EstadoEquipo.EN_REPARACION: return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case EstadoEquipo.DADO_DE_BAJA: return "bg-red-500/15 text-red-400 border-red-500/30";
    case EstadoEquipo.EN_BODEGA: return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

function tipoIcon(tipo: TipoEquipo) {
  switch (tipo) {
    case TipoEquipo.PC: return "🖥️";
    case TipoEquipo.NOTEBOOK: return "💻";
    case TipoEquipo.IMPRESORA: return "🖨️";
    case TipoEquipo.MONITOR: return "🖵";
    case TipoEquipo.TELEFONO: return "📞";
    default: return "📦";
  }
}

function prioridadColor(p: Prioridad) {
  switch (p) {
    case Prioridad.CRITICA: return "bg-red-500/15 text-red-400 border-red-500/30";
    case Prioridad.ALTA: return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case Prioridad.MEDIA: return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case Prioridad.BAJA: return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

function estadoTicketLabel(e: EstadoTicket) {
  switch (e) {
    case EstadoTicket.ABIERTO: return "Abierto";
    case EstadoTicket.EN_PROGRESO: return "En progreso";
    case EstadoTicket.RESUELTO: return "Resuelto";
    case EstadoTicket.CERRADO: return "Cerrado";
  }
}

// ─── Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const stats = getStats();

  const statCards = [
    { label: "Equipos Activos", value: stats.equiposActivos, total: stats.totalEquipos, icon: "🖥️", color: "from-cyan-500/20 to-blue-600/20", iconBg: "bg-cyan-500/15 text-cyan-400" },
    { label: "Impresoras", value: stats.totalImpresoras, icon: "🖨️", color: "from-violet-500/20 to-purple-600/20", iconBg: "bg-violet-500/15 text-violet-400" },
    { label: "Insumos en Alerta", value: stats.insumosAlerta, alert: stats.insumosCriticos > 0, icon: "📦", color: stats.insumosCriticos > 0 ? "from-red-500/20 to-orange-600/20" : "from-emerald-500/20 to-green-600/20", iconBg: stats.insumosCriticos > 0 ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400" },
    { label: "Tickets Abiertos", value: stats.ticketsAbiertos, alert: stats.ticketsCriticos > 0, icon: "🎫", color: stats.ticketsCriticos > 0 ? "from-amber-500/20 to-yellow-600/20" : "from-sky-500/20 to-blue-600/20", iconBg: stats.ticketsCriticos > 0 ? "bg-amber-500/15 text-amber-400" : "bg-sky-500/15 text-sky-400" },
    { label: "Usuarios", value: stats.totalUsuarios, icon: "👥", color: "from-indigo-500/20 to-blue-600/20", iconBg: "bg-indigo-500/15 text-indigo-400" },
    { label: "En Reparación", value: stats.equiposEnReparacion, alert: stats.equiposEnReparacion > 0, icon: "🔧", color: "from-amber-500/20 to-orange-600/20", iconBg: "bg-amber-500/15 text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen general del estado de activos TI
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className={`relative overflow-hidden border-border/50 bg-gradient-to-br ${card.color} hover:scale-[1.02] transition-transform duration-200`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">
                    {card.value}
                    {card.total !== undefined && (
                      <span className="text-sm text-muted-foreground font-normal">
                        /{card.total}
                      </span>
                    )}
                  </p>
                </div>
                <span className={`text-lg p-2 rounded-lg ${card.iconBg}`}>
                  {card.icon}
                </span>
              </div>
              {card.alert && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-red-400 animate-status-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Requiere atención
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Equipment */}
        <Card className="lg:col-span-2 border-border/50">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border/50">
              <h2 className="text-sm font-semibold">Equipos Recientes</h2>
              <p className="text-xs text-muted-foreground">Últimos equipos registrados</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs">Equipo</TableHead>
                  <TableHead className="text-xs">IP</TableHead>
                  <TableHead className="text-xs">Ubicación</TableHead>
                  <TableHead className="text-xs">Usuario</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEquipos.slice(0, 6).map((equipo) => (
                  <TableRow key={equipo.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tipoIcon(equipo.tipo)}</span>
                        <div>
                          <p className="text-sm font-medium">{equipo.hostname || equipo.modelo}</p>
                          <p className="text-xs text-muted-foreground">{equipo.marca} {equipo.modelo}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono">
                        {equipo.ip || "—"}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">{equipo.ubicacion.nombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {equipo.usuario?.nombre || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${estadoColor(equipo.estado)}`}>
                        {equipo.estado.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <div className="space-y-4">
          {/* Critical Supplies */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-status-pulse" />
                <h3 className="text-sm font-semibold">Insumos Críticos</h3>
              </div>
              <div className="space-y-2">
                {mockInsumos
                  .filter((i) => i.stockActual <= i.stockMinimo)
                  .map((insumo) => (
                    <div
                      key={insumo.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg ${
                        insumo.stockActual === 0
                          ? "bg-red-500/10 border border-red-500/20"
                          : "bg-amber-500/10 border border-amber-500/20"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{insumo.modelo}</p>
                        <p className="text-xs text-muted-foreground">
                          {insumo.marca} · {insumo.tipo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold tabular-nums ${
                          insumo.stockActual === 0 ? "text-red-400" : "text-amber-400"
                        }`}>
                          {insumo.stockActual}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          mín: {insumo.stockMinimo}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">Tickets Recientes</h3>
              <div className="space-y-2">
                {mockTickets.slice(0, 4).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Badge variant="outline" className={`text-[10px] shrink-0 mt-0.5 ${prioridadColor(ticket.prioridad)}`}>
                      {ticket.prioridad}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ticket.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.usuario.nombre} · {estadoTicketLabel(ticket.estado)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
