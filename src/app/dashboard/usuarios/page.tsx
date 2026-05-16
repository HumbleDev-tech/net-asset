"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockUsuarios, mockEquipos } from "@/lib/mock-data";

export default function UsuariosPage() {
  const [search, setSearch] = useState("");

  const filtered = mockUsuarios.filter(
    (u) =>
      !search ||
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.rut.includes(search) ||
      u.correo?.toLowerCase().includes(search.toLowerCase()) ||
      u.ubicacion.nombre.toLowerCase().includes(search.toLowerCase())
  );

  function getEquiposCount(usuarioId: number) {
    return mockEquipos.filter((e) => e.usuarioId === usuarioId).length;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground mt-1">
          Personal registrado en el sistema
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
        <Card className="border-border/50 bg-gradient-to-br from-indigo-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Usuarios</p>
            <p className="text-2xl font-bold mt-1">{mockUsuarios.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-violet-500/10 to-purple-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ubicaciones</p>
            <p className="text-2xl font-bold mt-1">
              {new Set(mockUsuarios.map((u) => u.ubicacionId)).size}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-cyan-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Con Equipo</p>
            <p className="text-2xl font-bold mt-1">
              {mockUsuarios.filter((u) => getEquiposCount(u.id) > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Input
        placeholder="Buscar por nombre, RUT, correo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm h-9 bg-muted/30 border-border/50"
      />

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
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((usuario) => (
                  <TableRow key={usuario.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                          {usuario.nombre.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{usuario.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono text-muted-foreground">{usuario.rut}</code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{usuario.correo || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{usuario.cargo || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{usuario.ubicacion.nombre}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium tabular-nums">
                        {getEquiposCount(usuario.id)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
