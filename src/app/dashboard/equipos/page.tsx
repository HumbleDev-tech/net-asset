"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockEquipos, mockUbicaciones } from "@/lib/mock-data";
import { EstadoEquipo, TipoEquipo } from "@/generated/prisma/enums";

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

function estadoLabel(estado: EstadoEquipo) {
  return estado.replace(/_/g, " ");
}

export default function EquiposPage() {
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterUbicacion, setFilterUbicacion] = useState<string>("todos");

  const filtered = mockEquipos.filter((e) => {
    const matchSearch =
      !search ||
      e.hostname?.toLowerCase().includes(search.toLowerCase()) ||
      e.modelo?.toLowerCase().includes(search.toLowerCase()) ||
      e.ip?.toLowerCase().includes(search.toLowerCase()) ||
      e.marca?.toLowerCase().includes(search.toLowerCase()) ||
      e.numeroSerie?.toLowerCase().includes(search.toLowerCase()) ||
      e.usuario?.nombre.toLowerCase().includes(search.toLowerCase());

    const matchTipo = filterTipo === "todos" || e.tipo === filterTipo;
    const matchEstado = filterEstado === "todos" || e.estado === filterEstado;
    const matchUbicacion =
      filterUbicacion === "todos" || e.ubicacionId === Number(filterUbicacion);

    return matchSearch && matchTipo && matchEstado && matchUbicacion;
  });

  const countByEstado = (estado: EstadoEquipo) =>
    mockEquipos.filter((e) => e.estado === estado).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
          <p className="text-muted-foreground mt-1">
            Inventario completo de activos de TI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            {countByEstado(EstadoEquipo.ACTIVO)} Activos
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            {countByEstado(EstadoEquipo.EN_REPARACION)} En rep.
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
            {countByEstado(EstadoEquipo.DADO_DE_BAJA)} Baja
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Buscar</label>
              <Input
                placeholder="Hostname, IP, modelo, serie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 bg-muted/30 border-border/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Tipo</label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.values(TipoEquipo).map((t) => (
                    <SelectItem key={t} value={t}>
                      {tipoIcon(t)} {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Estado</label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.values(EstadoEquipo).map((e) => (
                    <SelectItem key={e} value={e}>
                      {estadoLabel(e)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Ubicación</label>
              <Select value={filterUbicacion} onValueChange={setFilterUbicacion}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {mockUbicaciones.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs w-10">#</TableHead>
                <TableHead className="text-xs">Equipo</TableHead>
                <TableHead className="text-xs">Nº Serie</TableHead>
                <TableHead className="text-xs">IP</TableHead>
                <TableHead className="text-xs">Ubicación</TableHead>
                <TableHead className="text-xs">Usuario</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No se encontraron equipos con los filtros seleccionados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((equipo) => (
                  <TableRow key={equipo.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {equipo.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg shrink-0">{tipoIcon(equipo.tipo)}</span>
                        <div>
                          <p className="text-sm font-medium">{equipo.hostname || "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {equipo.marca} {equipo.modelo}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-muted-foreground font-mono">
                        {equipo.numeroSerie || "—"}
                      </code>
                    </TableCell>
                    <TableCell>
                      {equipo.ip ? (
                        <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono text-primary">
                          {equipo.ip}
                        </code>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{equipo.ubicacion.nombre}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {equipo.usuario?.nombre || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${estadoColor(equipo.estado)}`}>
                        {estadoLabel(equipo.estado)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="px-4 py-3 border-t border-border/30 text-xs text-muted-foreground">
            Mostrando {filtered.length} de {mockEquipos.length} equipos
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
