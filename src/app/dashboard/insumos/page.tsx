"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getInsumos, registrarMovimiento } from "@/lib/actions/insumos";
import { TipoMovimiento } from "@/generated/prisma/enums";
import { tipoInsumoLabel, stockStatus } from "@/lib/helpers";

type InsumoItem = Awaited<ReturnType<typeof getInsumos>>[number];

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<InsumoItem[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"instalar" | "recibir">("instalar");
  const [selectedInsumo, setSelectedInsumo] = useState<InsumoItem | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const data = await getInsumos();
      setInsumos(data);
    });
  };

  useEffect(() => { loadData(); }, []);

  const filtered = insumos.filter((i) =>
    !search || i.modelo.toLowerCase().includes(search.toLowerCase()) || i.marca?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const aS = a.stockActual === 0 ? 0 : a.stockActual <= a.stockMinimo ? 1 : 2;
    const bS = b.stockActual === 0 ? 0 : b.stockActual <= b.stockMinimo ? 1 : 2;
    return aS - bS;
  });

  const insumosAlerta = insumos.filter((i) => i.stockActual <= i.stockMinimo).length;
  const insumosCriticos = insumos.filter((i) => i.stockActual === 0).length;
  const totalStock = insumos.reduce((sum, i) => sum + i.stockActual, 0);

  function openDialog(insumo: InsumoItem, mode: "instalar" | "recibir") {
    setSelectedInsumo(insumo);
    setDialogMode(mode);
    setCantidad(1);
    setDialogOpen(true);
  }

  async function handleAction() {
    if (!selectedInsumo) return;
    await registrarMovimiento({
      insumoId: selectedInsumo.id,
      tipo: dialogMode === "instalar" ? TipoMovimiento.SALIDA : TipoMovimiento.ENTRADA,
      cantidad,
      nota: dialogMode === "instalar" ? "Instalación en equipo" : "Recepción de stock",
    });
    setDialogOpen(false);
    loadData();
  }

  if (isPending && insumos.length === 0) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Inventario de Insumos</h1>
        <p className="text-muted-foreground mt-1">Cargando...</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventario de Insumos</h1>
        <p className="text-muted-foreground mt-1">Gestión de tóners, tintas y drums</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <Card className="border-border/50 bg-gradient-to-br from-slate-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Insumos</p>
            <p className="text-2xl font-bold mt-1">{insumos.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-cyan-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Stock Total</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{totalStock} uds.</p>
          </CardContent>
        </Card>
        <Card className={`border-border/50 bg-gradient-to-br ${insumosAlerta > 0 ? "from-amber-500/10 to-orange-600/10" : "from-emerald-500/10 to-green-600/10"}`}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">En Alerta</p>
            <p className={`text-2xl font-bold mt-1 ${insumosAlerta > 0 ? "text-amber-400" : "text-emerald-400"}`}>{insumosAlerta}</p>
          </CardContent>
        </Card>
        <Card className={`border-border/50 bg-gradient-to-br ${insumosCriticos > 0 ? "from-red-500/10 to-orange-600/10" : "from-emerald-500/10 to-green-600/10"}`}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Sin Stock</p>
            <p className={`text-2xl font-bold mt-1 ${insumosCriticos > 0 ? "text-red-400" : "text-emerald-400"}`}>{insumosCriticos}</p>
          </CardContent>
        </Card>
      </div>

      <Input placeholder="Buscar por modelo o marca..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-9 bg-muted/30 border-border/50" />

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs">Insumo</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Marca</TableHead>
                <TableHead className="text-xs">Stock</TableHead>
                <TableHead className="text-xs">Nivel</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((insumo) => {
                const status = stockStatus(insumo.stockActual, insumo.stockMinimo);
                const barPercent = Math.min(100, (insumo.stockActual / (insumo.stockMinimo * 3)) * 100);
                return (
                  <TableRow key={insumo.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell><p className="text-sm font-semibold font-mono">{insumo.modelo}</p></TableCell>
                    <TableCell className="text-sm">{tipoInsumoLabel(insumo.tipo)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{insumo.marca || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-lg font-bold tabular-nums ${insumo.stockActual === 0 ? "text-red-400" : insumo.stockActual <= insumo.stockMinimo ? "text-amber-400" : "text-foreground"}`}>{insumo.stockActual}</span>
                        <span className="text-xs text-muted-foreground">/ mín {insumo.stockMinimo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-20 h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${status.barColor}`} style={{ width: `${barPercent}%` }} />
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${status.class}`}>{status.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 text-xs border-border/50 hover:bg-red-500/10 hover:text-red-400" disabled={insumo.stockActual === 0} onClick={() => openDialog(insumo, "instalar")}>− Instalar</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs border-border/50 hover:bg-emerald-500/10 hover:text-emerald-400" onClick={() => openDialog(insumo, "recibir")}>+ Recibir</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === "instalar" ? "Instalar Insumo" : "Recibir Insumo"}</DialogTitle>
            <DialogDescription>{dialogMode === "instalar" ? `Restar stock de ${selectedInsumo?.modelo}` : `Agregar stock a ${selectedInsumo?.modelo}`}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 block">Cantidad</label>
                <Input type="number" min={1} max={dialogMode === "instalar" ? selectedInsumo?.stockActual || 1 : 100} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className="bg-muted/30 border-border/50" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Stock actual</p>
                <p className="text-2xl font-bold tabular-nums">{selectedInsumo?.stockActual}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-sm">Nuevo stock: <span className="font-bold text-primary">{selectedInsumo ? (dialogMode === "instalar" ? Math.max(0, selectedInsumo.stockActual - cantidad) : selectedInsumo.stockActual + cantidad) : 0}</span></p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAction} className={dialogMode === "instalar" ? "bg-red-500/80 hover:bg-red-500 text-white" : "bg-emerald-500/80 hover:bg-emerald-500 text-white"}>
                {dialogMode === "instalar" ? "Confirmar Instalación" : "Confirmar Recepción"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
