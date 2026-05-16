import {
  TipoEquipo,
  EstadoEquipo,
  TipoInsumo,
  EstadoTicket,
  Prioridad,
} from "@/generated/prisma/enums";

// ─── Mock data for development without DB ──────────────────────

export const mockUbicaciones = [
  { id: 1, nombre: "Maternidad" },
  { id: 2, nombre: "Finanzas" },
  { id: 3, nombre: "HODOM" },
  { id: 4, nombre: "Urgencias" },
  { id: 5, nombre: "Farmacia" },
  { id: 6, nombre: "Laboratorio" },
  { id: 7, nombre: "Dirección" },
  { id: 8, nombre: "Recursos Humanos" },
];

export const mockUsuarios = [
  { id: 1, rut: "12.345.678-9", nombre: "María González", correo: "mgonzalez@hospital.cl", cargo: "Enfermera Jefe", ubicacionId: 1, ubicacion: { nombre: "Maternidad" } },
  { id: 2, rut: "13.456.789-0", nombre: "Juan Pérez", correo: "jperez@hospital.cl", cargo: "Contador", ubicacionId: 2, ubicacion: { nombre: "Finanzas" } },
  { id: 3, rut: "14.567.890-1", nombre: "Ana Martínez", correo: "amartinez@hospital.cl", cargo: "Médico", ubicacionId: 4, ubicacion: { nombre: "Urgencias" } },
  { id: 4, rut: "15.678.901-2", nombre: "Carlos Rojas", correo: "crojas@hospital.cl", cargo: "Químico Farmacéutico", ubicacionId: 5, ubicacion: { nombre: "Farmacia" } },
  { id: 5, rut: "16.789.012-3", nombre: "Patricia Soto", correo: "psoto@hospital.cl", cargo: "Directora", ubicacionId: 7, ubicacion: { nombre: "Dirección" } },
  { id: 6, rut: "17.890.123-4", nombre: "Roberto Díaz", correo: "rdiaz@hospital.cl", cargo: "Jefe RRHH", ubicacionId: 8, ubicacion: { nombre: "Recursos Humanos" } },
  { id: 7, rut: "18.901.234-5", nombre: "Sofía Muñoz", correo: "smunoz@hospital.cl", cargo: "Tecnóloga", ubicacionId: 6, ubicacion: { nombre: "Laboratorio" } },
  { id: 8, rut: "19.012.345-6", nombre: "Diego Vargas", correo: "dvargas@hospital.cl", cargo: "Administrativo", ubicacionId: 3, ubicacion: { nombre: "HODOM" } },
];

export const mockEquipos = [
  { id: 1, tipo: TipoEquipo.PC, marca: "HP", modelo: "ProDesk 400 G7", numeroSerie: "CND1234ABC", ip: "10.4.46.101", hostname: "PC-MAT-01", estado: EstadoEquipo.ACTIVO, ubicacionId: 1, ubicacion: { nombre: "Maternidad" }, usuarioId: 1, usuario: { nombre: "María González" } },
  { id: 2, tipo: TipoEquipo.PC, marca: "Lenovo", modelo: "ThinkCentre M70q", numeroSerie: "PF3K789D", ip: "10.4.46.102", hostname: "PC-FIN-01", estado: EstadoEquipo.ACTIVO, ubicacionId: 2, ubicacion: { nombre: "Finanzas" }, usuarioId: 2, usuario: { nombre: "Juan Pérez" } },
  { id: 3, tipo: TipoEquipo.IMPRESORA, marca: "HP", modelo: "LaserJet M507", numeroSerie: "VNB4501XYZ", ip: "10.4.46.201", hostname: "IMP-MAT-01", estado: EstadoEquipo.ACTIVO, ubicacionId: 1, ubicacion: { nombre: "Maternidad" }, usuarioId: null, usuario: null },
  { id: 4, tipo: TipoEquipo.IMPRESORA, marca: "Brother", modelo: "MFC-L2710DW", numeroSerie: "U64582AW", ip: "10.4.46.202", hostname: "IMP-FIN-01", estado: EstadoEquipo.ACTIVO, ubicacionId: 2, ubicacion: { nombre: "Finanzas" }, usuarioId: null, usuario: null },
  { id: 5, tipo: TipoEquipo.PC, marca: "HP", modelo: "ProDesk 400 G6", numeroSerie: "CND5678DEF", ip: "10.4.46.103", hostname: "PC-URG-01", estado: EstadoEquipo.EN_REPARACION, ubicacionId: 4, ubicacion: { nombre: "Urgencias" }, usuarioId: 3, usuario: { nombre: "Ana Martínez" } },
  { id: 6, tipo: TipoEquipo.NOTEBOOK, marca: "Lenovo", modelo: "ThinkPad L14", numeroSerie: "PF5L012G", ip: "10.4.46.150", hostname: "NB-DIR-01", estado: EstadoEquipo.ACTIVO, ubicacionId: 7, ubicacion: { nombre: "Dirección" }, usuarioId: 5, usuario: { nombre: "Patricia Soto" } },
  { id: 7, tipo: TipoEquipo.IMPRESORA, marca: "HP", modelo: "LaserJet M404", numeroSerie: "VNB6789GHI", ip: "10.4.46.203", hostname: "IMP-URG-01", estado: EstadoEquipo.ACTIVO, ubicacionId: 4, ubicacion: { nombre: "Urgencias" }, usuarioId: null, usuario: null },
  { id: 8, tipo: TipoEquipo.PC, marca: "HP", modelo: "ProDesk 400 G7", numeroSerie: "CND9012JKL", ip: "10.4.46.104", hostname: "PC-FAR-01", estado: EstadoEquipo.ACTIVO, ubicacionId: 5, ubicacion: { nombre: "Farmacia" }, usuarioId: 4, usuario: { nombre: "Carlos Rojas" } },
  { id: 9, tipo: TipoEquipo.MONITOR, marca: "Samsung", modelo: "24\" FHD S24R350", numeroSerie: "HXAY300123", ip: null, hostname: null, estado: EstadoEquipo.ACTIVO, ubicacionId: 2, ubicacion: { nombre: "Finanzas" }, usuarioId: 2, usuario: { nombre: "Juan Pérez" } },
  { id: 10, tipo: TipoEquipo.PC, marca: "HP", modelo: "ProDesk 400 G5", numeroSerie: "CND3456MNO", ip: "10.4.46.105", hostname: "PC-LAB-01", estado: EstadoEquipo.DADO_DE_BAJA, ubicacionId: 6, ubicacion: { nombre: "Laboratorio" }, usuarioId: null, usuario: null },
  { id: 11, tipo: TipoEquipo.IMPRESORA, marca: "HP", modelo: "LaserJet M507", numeroSerie: "VNB1122PQR", ip: "10.4.46.204", hostname: "IMP-HOD-01", estado: EstadoEquipo.ACTIVO, ubicacionId: 3, ubicacion: { nombre: "HODOM" }, usuarioId: null, usuario: null },
  { id: 12, tipo: TipoEquipo.PC, marca: "Lenovo", modelo: "ThinkCentre M90q", numeroSerie: "PF7M345H", ip: "10.4.46.106", hostname: "PC-RRH-01", estado: EstadoEquipo.ACTIVO, ubicacionId: 8, ubicacion: { nombre: "Recursos Humanos" }, usuarioId: 6, usuario: { nombre: "Roberto Díaz" } },
];

export const mockInsumos = [
  { id: 1, modelo: "W9004MC", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 3, stockMinimo: 2 },
  { id: 2, modelo: "TN-1060", tipo: TipoInsumo.TONER, marca: "Brother", stockActual: 1, stockMinimo: 2 },
  { id: 3, modelo: "CF258A", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 5, stockMinimo: 3 },
  { id: 4, modelo: "CF226A", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 0, stockMinimo: 2 },
  { id: 5, modelo: "DR-1060", tipo: TipoInsumo.DRUM, marca: "Brother", stockActual: 2, stockMinimo: 1 },
  { id: 6, modelo: "CF259A", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 4, stockMinimo: 3 },
  { id: 7, modelo: "TN-2420", tipo: TipoInsumo.TONER, marca: "Brother", stockActual: 0, stockMinimo: 2 },
  { id: 8, modelo: "W1106A", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 6, stockMinimo: 3 },
];

export const mockTickets = [
  { id: 1, titulo: "PC no enciende", descripcion: "El equipo no responde al botón de encendido", prioridad: Prioridad.ALTA, estado: EstadoTicket.ABIERTO, usuarioId: 3, usuario: { nombre: "Ana Martínez" }, equipoId: 5, equipo: { hostname: "PC-URG-01", tipo: TipoEquipo.PC }, createdAt: new Date("2026-05-15T10:30:00") },
  { id: 2, titulo: "Impresora atascada", descripcion: "La impresora Brother tiene papel atascado frecuentemente", prioridad: Prioridad.MEDIA, estado: EstadoTicket.EN_PROGRESO, usuarioId: 2, usuario: { nombre: "Juan Pérez" }, equipoId: 4, equipo: { hostname: "IMP-FIN-01", tipo: TipoEquipo.IMPRESORA }, createdAt: new Date("2026-05-14T08:15:00") },
  { id: 3, titulo: "Solicitar tóner", descripcion: "Se acabó el tóner de la impresora de Maternidad", prioridad: Prioridad.BAJA, estado: EstadoTicket.RESUELTO, usuarioId: 1, usuario: { nombre: "María González" }, equipoId: 3, equipo: { hostname: "IMP-MAT-01", tipo: TipoEquipo.IMPRESORA }, createdAt: new Date("2026-05-12T14:00:00") },
  { id: 4, titulo: "Sin acceso a red", descripcion: "No puedo acceder al sistema desde mi equipo", prioridad: Prioridad.CRITICA, estado: EstadoTicket.ABIERTO, usuarioId: 4, usuario: { nombre: "Carlos Rojas" }, equipoId: 8, equipo: { hostname: "PC-FAR-01", tipo: TipoEquipo.PC }, createdAt: new Date("2026-05-15T16:45:00") },
  { id: 5, titulo: "Monitor con líneas", descripcion: "El monitor muestra líneas horizontales", prioridad: Prioridad.MEDIA, estado: EstadoTicket.ABIERTO, usuarioId: 2, usuario: { nombre: "Juan Pérez" }, equipoId: 9, equipo: { hostname: null, tipo: TipoEquipo.MONITOR }, createdAt: new Date("2026-05-15T09:00:00") },
];

// ─── Stats helpers ──────────────────────────────────────────────
export function getStats() {
  const totalEquipos = mockEquipos.length;
  const equiposActivos = mockEquipos.filter((e) => e.estado === EstadoEquipo.ACTIVO).length;
  const equiposEnReparacion = mockEquipos.filter((e) => e.estado === EstadoEquipo.EN_REPARACION).length;
  const totalImpresoras = mockEquipos.filter((e) => e.tipo === TipoEquipo.IMPRESORA).length;
  const totalPCs = mockEquipos.filter((e) => e.tipo === TipoEquipo.PC || e.tipo === TipoEquipo.NOTEBOOK).length;
  const insumosAlerta = mockInsumos.filter((i) => i.stockActual <= i.stockMinimo).length;
  const insumosCriticos = mockInsumos.filter((i) => i.stockActual === 0).length;
  const ticketsAbiertos = mockTickets.filter((t) => t.estado === EstadoTicket.ABIERTO).length;
  const ticketsCriticos = mockTickets.filter((t) => t.prioridad === Prioridad.CRITICA && t.estado !== EstadoTicket.RESUELTO && t.estado !== EstadoTicket.CERRADO).length;

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
    totalUsuarios: mockUsuarios.length,
    totalUbicaciones: mockUbicaciones.length,
  };
}
