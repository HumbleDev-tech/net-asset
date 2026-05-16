"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEmpleados } from "@/lib/actions/empleados";

type EmpleadoItem = Awaited<ReturnType<typeof getEmpleados>>[number];

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<EmpleadoItem[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getEmpleados();
      setEmpleados(data);
    });
  }, []);

  const filtered = empleados.filter((u) =>
    !search ||
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.rut?.includes(search) ||
    u.correo?.toLowerCase().includes(search.toLowerCase()) ||
    u.ubicacion.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (isPending && empleados.length === 0) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Empleados</h1>
        <p className="text-muted-foreground mt-1">Cargando...</p></div>
      </div>
    );
  }

  const conEquipo = empleados.filter((e) => e._count.equipos > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Empleados</h1>
        <p className="text-muted-foreground mt-1">Personal registrado en la organización</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
        <Card className="border-border/50 bg-gradient-to-br from-indigo-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Empleados</p>
            <p className="text-2xl font-bold mt-1">{empleados.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-violet-500/10 to-purple-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ubicaciones</p>
            <p className="text-2xl font-bold mt-1">{new Set(empleados.map((u) => u.ubicacionId)).size}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-cyan-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Con Equipo</p>
            <p className="text-2xl font-bold mt-1">{conEquipo}</p>
          </CardContent>
        </Card>
      </div>

      <Input placeholder="Buscar por nombre, RUT, correo..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-9 bg-muted/30 border-border/50" />

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs">Nombre</TableHead>
                <TableHead className="text-xs">RUT</TableHead>
                <TableHead className="text-xs">Correo</TableHead>
                <TableHead className="text-xs">Cargo</TableHead>
                <TableHead className="text-xs">Ubicación</TableHead>
                <TableHead className="text-xs text-center">Equipos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No se encontraron empleados</TableCell></TableRow>
              ) : filtered.map((emp) => (
                <TableRow key={emp.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-semibold shrink-0">{emp.nombre.charAt(0)}</div>
                      <span className="text-sm font-medium">{emp.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell><code className="text-xs font-mono text-muted-foreground">{emp.rut || "—"}</code></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{emp.correo || "—"}</TableCell>
                  <TableCell className="text-sm">{emp.cargo || "—"}</TableCell>
                  <TableCell className="text-sm">{emp.ubicacion.nombre}</TableCell>
                  <TableCell className="text-center text-sm font-medium tabular-nums">{emp._count.equipos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
