// ─── Seed script: populates the DB with demo data ──────────────
// Run with: npx prisma db seed
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// Enums - hardcoded to avoid ESM import issues with generated client
const OrgType = { HOSPITAL: "HOSPITAL" } as const;
const Role = { ORG_ADMIN: "ORG_ADMIN" } as const;
const TipoEquipo = { PC: "PC", NOTEBOOK: "NOTEBOOK", IMPRESORA: "IMPRESORA", MONITOR: "MONITOR", TELEFONO: "TELEFONO", SERVIDOR: "SERVIDOR", SWITCH: "SWITCH", ROUTER: "ROUTER", TABLET: "TABLET", OTRO: "OTRO" } as const;
const EstadoEquipo = { ACTIVO: "ACTIVO", EN_REPARACION: "EN_REPARACION", DADO_DE_BAJA: "DADO_DE_BAJA", EN_BODEGA: "EN_BODEGA", PRESTADO: "PRESTADO" } as const;
const TipoInsumo = { TONER: "TONER", TINTA: "TINTA", DRUM: "DRUM", CABLE: "CABLE", OTRO: "OTRO" } as const;
const EstadoTicket = { ABIERTO: "ABIERTO", EN_PROGRESO: "EN_PROGRESO", RESUELTO: "RESUELTO", CERRADO: "CERRADO" } as const;
const Prioridad = { BAJA: "BAJA", MEDIA: "MEDIA", ALTA: "ALTA", CRITICA: "CRITICA" } as const;

async function main() {
  console.log("🌱 Seeding NetAsset demo data...\n");

  // ─── 1. Organization ────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: "hospital-demo" },
    update: {},
    create: {
      name: "Hospital Regional de Valparaíso",
      slug: "hospital-demo",
      type: OrgType.HOSPITAL,
    },
  });
  console.log(`✅ Organization: ${org.name} (${org.id})`);

  // ─── 2. Demo User + Membership ──────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "admin@netasset.dev" },
    update: {},
    create: {
      name: "Admin Demo",
      email: "admin@netasset.dev",
    },
  });

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: user.id, orgId: org.id } },
    update: {},
    create: {
      userId: user.id,
      orgId: org.id,
      role: Role.ORG_ADMIN,
    },
  });
  console.log(`✅ User: ${user.email} → ${Role.ORG_ADMIN}`);

  // ─── 3. Ubicaciones ─────────────────────────────────────────
  const ubicacionesData = [
    "Maternidad", "Finanzas", "HODOM", "Urgencias",
    "Farmacia", "Laboratorio", "Dirección", "Recursos Humanos",
  ];

  const ubicaciones: Record<string, { id: number }> = {};
  for (const nombre of ubicacionesData) {
    const ub = await prisma.ubicacion.upsert({
      where: { orgId_nombre: { orgId: org.id, nombre } },
      update: {},
      create: { nombre, orgId: org.id },
    });
    ubicaciones[nombre] = ub;
  }
  console.log(`✅ Ubicaciones: ${Object.keys(ubicaciones).length}`);

  // ─── 4. Empleados ───────────────────────────────────────────
  const empleadosData = [
    { rut: "12.345.678-9", nombre: "María González", correo: "mgonzalez@hospital.cl", cargo: "Enfermera Jefe", ubicacion: "Maternidad" },
    { rut: "13.456.789-0", nombre: "Juan Pérez", correo: "jperez@hospital.cl", cargo: "Contador", ubicacion: "Finanzas" },
    { rut: "14.567.890-1", nombre: "Ana Martínez", correo: "amartinez@hospital.cl", cargo: "Médico", ubicacion: "Urgencias" },
    { rut: "15.678.901-2", nombre: "Carlos Rojas", correo: "crojas@hospital.cl", cargo: "Químico Farmacéutico", ubicacion: "Farmacia" },
    { rut: "16.789.012-3", nombre: "Patricia Soto", correo: "psoto@hospital.cl", cargo: "Directora", ubicacion: "Dirección" },
    { rut: "17.890.123-4", nombre: "Roberto Díaz", correo: "rdiaz@hospital.cl", cargo: "Jefe RRHH", ubicacion: "Recursos Humanos" },
    { rut: "18.901.234-5", nombre: "Sofía Muñoz", correo: "smunoz@hospital.cl", cargo: "Tecnóloga", ubicacion: "Laboratorio" },
    { rut: "19.012.345-6", nombre: "Diego Vargas", correo: "dvargas@hospital.cl", cargo: "Administrativo", ubicacion: "HODOM" },
  ];

  const empleados: Record<string, { id: number }> = {};
  for (const e of empleadosData) {
    const emp = await prisma.empleado.upsert({
      where: { orgId_rut: { orgId: org.id, rut: e.rut } },
      update: {},
      create: {
        rut: e.rut,
        nombre: e.nombre,
        correo: e.correo,
        cargo: e.cargo,
        ubicacionId: ubicaciones[e.ubicacion].id,
        orgId: org.id,
      },
    });
    empleados[e.nombre] = emp;
  }
  console.log(`✅ Empleados: ${Object.keys(empleados).length}`);

  // ─── 5. Equipos ─────────────────────────────────────────────
  const equiposData = [
    { tipo: TipoEquipo.PC, marca: "HP", modelo: "ProDesk 400 G7", numeroSerie: "CND1234ABC", ip: "10.4.46.101", hostname: "PC-MAT-01", so: "Windows 11 Pro", ram: "8 GB", disco: "256 GB SSD", procesador: "Intel i5-10400", estado: EstadoEquipo.ACTIVO, ubicacion: "Maternidad", empleado: "María González" },
    { tipo: TipoEquipo.PC, marca: "Lenovo", modelo: "ThinkCentre M70q", numeroSerie: "PF3K789D", ip: "10.4.46.102", hostname: "PC-FIN-01", so: "Windows 11 Pro", ram: "16 GB", disco: "512 GB SSD", procesador: "Intel i7-10700", estado: EstadoEquipo.ACTIVO, ubicacion: "Finanzas", empleado: "Juan Pérez" },
    { tipo: TipoEquipo.IMPRESORA, marca: "HP", modelo: "LaserJet M507", numeroSerie: "VNB4501XYZ", ip: "10.4.46.201", hostname: "IMP-MAT-01", estado: EstadoEquipo.ACTIVO, ubicacion: "Maternidad", empleado: null },
    { tipo: TipoEquipo.IMPRESORA, marca: "Brother", modelo: "MFC-L2710DW", numeroSerie: "U64582AW", ip: "10.4.46.202", hostname: "IMP-FIN-01", estado: EstadoEquipo.ACTIVO, ubicacion: "Finanzas", empleado: null },
    { tipo: TipoEquipo.PC, marca: "HP", modelo: "ProDesk 400 G6", numeroSerie: "CND5678DEF", ip: "10.4.46.103", hostname: "PC-URG-01", so: "Windows 10 Pro", ram: "8 GB", disco: "256 GB SSD", procesador: "Intel i5-9400", estado: EstadoEquipo.EN_REPARACION, ubicacion: "Urgencias", empleado: "Ana Martínez" },
    { tipo: TipoEquipo.NOTEBOOK, marca: "Lenovo", modelo: "ThinkPad L14", numeroSerie: "PF5L012G", ip: "10.4.46.150", hostname: "NB-DIR-01", so: "Windows 11 Pro", ram: "16 GB", disco: "512 GB SSD", procesador: "Intel i7-1165G7", estado: EstadoEquipo.ACTIVO, ubicacion: "Dirección", empleado: "Patricia Soto" },
    { tipo: TipoEquipo.IMPRESORA, marca: "HP", modelo: "LaserJet M404", numeroSerie: "VNB6789GHI", ip: "10.4.46.203", hostname: "IMP-URG-01", estado: EstadoEquipo.ACTIVO, ubicacion: "Urgencias", empleado: null },
    { tipo: TipoEquipo.PC, marca: "HP", modelo: "ProDesk 400 G7", numeroSerie: "CND9012JKL", ip: "10.4.46.104", hostname: "PC-FAR-01", so: "Windows 11 Pro", ram: "8 GB", disco: "256 GB SSD", procesador: "Intel i5-10400", estado: EstadoEquipo.ACTIVO, ubicacion: "Farmacia", empleado: "Carlos Rojas" },
    { tipo: TipoEquipo.MONITOR, marca: "Samsung", modelo: "24\" FHD S24R350", numeroSerie: "HXAY300123", estado: EstadoEquipo.ACTIVO, ubicacion: "Finanzas", empleado: "Juan Pérez" },
    { tipo: TipoEquipo.PC, marca: "HP", modelo: "ProDesk 400 G5", numeroSerie: "CND3456MNO", ip: "10.4.46.105", hostname: "PC-LAB-01", so: "Windows 10 Pro", ram: "4 GB", disco: "500 GB HDD", procesador: "Intel i3-8100", estado: EstadoEquipo.DADO_DE_BAJA, ubicacion: "Laboratorio", empleado: null },
    { tipo: TipoEquipo.IMPRESORA, marca: "HP", modelo: "LaserJet M507", numeroSerie: "VNB1122PQR", ip: "10.4.46.204", hostname: "IMP-HOD-01", estado: EstadoEquipo.ACTIVO, ubicacion: "HODOM", empleado: null },
    { tipo: TipoEquipo.PC, marca: "Lenovo", modelo: "ThinkCentre M90q", numeroSerie: "PF7M345H", ip: "10.4.46.106", hostname: "PC-RRH-01", so: "Windows 11 Pro", ram: "16 GB", disco: "256 GB SSD", procesador: "Intel i5-10500", estado: EstadoEquipo.ACTIVO, ubicacion: "Recursos Humanos", empleado: "Roberto Díaz" },
  ];

  const equiposMap: Record<string, { id: number }> = {};
  for (const eq of equiposData) {
    const equipo = await prisma.equipo.upsert({
      where: { orgId_numeroSerie: { orgId: org.id, numeroSerie: eq.numeroSerie } },
      update: {},
      create: {
        tipo: eq.tipo,
        marca: eq.marca,
        modelo: eq.modelo,
        numeroSerie: eq.numeroSerie,
        ip: eq.ip ?? null,
        hostname: eq.hostname ?? null,
        so: (eq as any).so ?? null,
        ram: (eq as any).ram ?? null,
        disco: (eq as any).disco ?? null,
        procesador: (eq as any).procesador ?? null,
        estado: eq.estado,
        ubicacionId: ubicaciones[eq.ubicacion].id,
        empleadoId: eq.empleado ? empleados[eq.empleado].id : null,
        orgId: org.id,
      },
    });
    if (eq.hostname) equiposMap[eq.hostname] = equipo;
  }
  console.log(`✅ Equipos: ${equiposData.length}`);

  // ─── 6. Insumos ─────────────────────────────────────────────
  const insumosData = [
    { modelo: "W9004MC", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 3, stockMinimo: 2 },
    { modelo: "TN-1060", tipo: TipoInsumo.TONER, marca: "Brother", stockActual: 1, stockMinimo: 2 },
    { modelo: "CF258A", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 5, stockMinimo: 3 },
    { modelo: "CF226A", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 0, stockMinimo: 2 },
    { modelo: "DR-1060", tipo: TipoInsumo.DRUM, marca: "Brother", stockActual: 2, stockMinimo: 1 },
    { modelo: "CF259A", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 4, stockMinimo: 3 },
    { modelo: "TN-2420", tipo: TipoInsumo.TONER, marca: "Brother", stockActual: 0, stockMinimo: 2 },
    { modelo: "W1106A", tipo: TipoInsumo.TONER, marca: "HP", stockActual: 6, stockMinimo: 3 },
  ];

  for (const ins of insumosData) {
    await prisma.insumo.upsert({
      where: { orgId_modelo: { orgId: org.id, modelo: ins.modelo } },
      update: {},
      create: { ...ins, orgId: org.id },
    });
  }
  console.log(`✅ Insumos: ${insumosData.length}`);

  // ─── 7. Tickets ─────────────────────────────────────────────
  // Delete existing tickets for this org before recreating (no unique field for upsert)
  await prisma.ticket.deleteMany({ where: { orgId: org.id } });

  const ticketsData = [
    { titulo: "PC no enciende", descripcion: "El equipo no responde al botón de encendido", prioridad: Prioridad.ALTA, estado: EstadoTicket.ABIERTO, empleado: "Ana Martínez", equipo: "PC-URG-01" },
    { titulo: "Impresora atascada", descripcion: "La impresora Brother tiene papel atascado frecuentemente", prioridad: Prioridad.MEDIA, estado: EstadoTicket.EN_PROGRESO, empleado: "Juan Pérez", equipo: "IMP-FIN-01" },
    { titulo: "Solicitar tóner", descripcion: "Se acabó el tóner de la impresora de Maternidad", prioridad: Prioridad.BAJA, estado: EstadoTicket.RESUELTO, empleado: "María González", equipo: "IMP-MAT-01" },
    { titulo: "Sin acceso a red", descripcion: "No puedo acceder al sistema desde mi equipo", prioridad: Prioridad.CRITICA, estado: EstadoTicket.ABIERTO, empleado: "Carlos Rojas", equipo: "PC-FAR-01" },
    { titulo: "Monitor con líneas", descripcion: "El monitor muestra líneas horizontales", prioridad: Prioridad.MEDIA, estado: EstadoTicket.ABIERTO, empleado: "Juan Pérez", equipo: null },
  ];

  for (const t of ticketsData) {
    await prisma.ticket.create({
      data: {
        titulo: t.titulo,
        descripcion: t.descripcion,
        prioridad: t.prioridad,
        estado: t.estado,
        empleadoId: empleados[t.empleado].id,
        equipoId: t.equipo ? equiposMap[t.equipo]?.id ?? null : null,
        orgId: org.id,
      },
    });
  }
  console.log(`✅ Tickets: ${ticketsData.length}`);
  console.log("\n🎉 Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
