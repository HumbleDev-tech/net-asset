"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEquipos } from "@/lib/actions/equipos";
import { getUbicaciones } from "@/lib/actions/ubicaciones";
import { EstadoEquipo, TipoEquipo } from "@/generated/prisma/enums";
import { estadoEquipoColor, tipoEquipoIcon, estadoEquipoLabel } from "@/lib/helpers";

type Equipo = Awaited<ReturnType<typeof getEquipos>>[number];
type Ubicacion = Awaited<ReturnType<typeof getUbicaciones>>[number];

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterUbicacion, setFilterUbicacion] = useState("todos");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const [eq, ub] = await Promise.all([getEquipos(), getUbicaciones()]);
      setEquipos(eq);
      setUbicaciones(ub);
    });
  }, []);

  const filtered = equipos.filter((e) => {
    const s = search.toLowerCase();
    const matchSearch = !search ||
      e.hostname?.toLowerCase().includes(s) ||
      e.modelo?.toLowerCase().includes(s) ||
      e.ip?.toLowerCase().includes(s) ||
      e.marca?.toLowerCase().includes(s) ||
      e.numeroSerie?.toLowerCase().includes(s) ||
      e.empleado?.nombre.toLowerCase().includes(s);
    return matchSearch &&
      (filterTipo === "todos" || e.tipo === filterTipo) &&
      (filterEstado === "todos" || e.estado === filterEstado) &&
      (filterUbicacion === "todos" || e.ubicacionId === Number(filterUbicacion));
  });

  const countByEstado = (estado: EstadoEquipo) => equipos.filter((e) => e.estado === estado).length;

  if (isPending && equipos.length === 0) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
        <p className="text-muted-foreground mt-1">Cargando inventario...</p></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Card key={i} className="border-border/50 animate-pulse"><CardContent className="p-4 h-16" /></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
          <p className="text-muted-foreground mt-1">Inventario completo de activos de TI</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">{countByEstado(EstadoEquipo.ACTIVO)} Activos</Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">{countByEstado(EstadoEquipo.EN_REPARACION)} En rep.</Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">{countByEstado(EstadoEquipo.DADO_DE_BAJA)} Baja</Badge>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Buscar</label>
              <Input placeholder="Hostname, IP, modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 bg-muted/30 border-border/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Tipo</label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.values(TipoEquipo).map((t) => <SelectItem key={t} value={t}>{tipoEquipoIcon(t)} {t.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Estado</label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.values(EstadoEquipo).map((e) => <SelectItem key={e} value={e}>{estadoEquipoLabel(e)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Ubicación</label>
              <Select value={filterUbicacion} onValueChange={setFilterUbicacion}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {ubicaciones.map((u) => <SelectItem key={u.id} value={u.id.toString()}>{u.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <TableHead className="text-xs">Empleado</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No se encontraron equipos</TableCell></TableRow>
              ) : filtered.map((equipo) => (
                <TableRow key={equipo.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                  <TableCell className="text-xs text-muted-foreground tabular-nums">{equipo.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg shrink-0">{tipoEquipoIcon(equipo.tipo)}</span>
                      <div>
                        <p className="text-sm font-medium">{equipo.hostname || "—"}</p>
                        <p className="text-xs text-muted-foreground">{equipo.marca} {equipo.modelo}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><code className="text-xs text-muted-foreground font-mono">{equipo.numeroSerie || "—"}</code></TableCell>
                  <TableCell>{equipo.ip ? <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono text-primary">{equipo.ip}</code> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-sm">{equipo.ubicacion.nombre}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{equipo.empleado?.nombre || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] ${estadoEquipoColor(equipo.estado)}`}>{estadoEquipoLabel(equipo.estado)}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 py-3 border-t border-border/30 text-xs text-muted-foreground">Mostrando {filtered.length} de {equipos.length} equipos</div>
        </CardContent>
      </Card>
    </div>
  );
}
