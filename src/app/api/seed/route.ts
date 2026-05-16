// ─── Seed API Route ─────────────────────────────────────────────
// POST /api/seed — Seeds the database with demo data
// This exists because Prisma 7's generated client requires the Next.js build context.

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
    }

    console.log("🌱 Seeding NetAsset demo data...\n");

    // 1. Organization
    const org = await prisma.organization.upsert({
      where: { slug: "hospital-demo" },
      update: {},
      create: { name: "Hospital Regional de Valparaíso", slug: "hospital-demo", type: "HOSPITAL" },
    });

    // 2. Demo User + Membership
    const user = await prisma.user.upsert({
      where: { email: "admin@netasset.dev" },
      update: {},
      create: { name: "Admin Demo", email: "admin@netasset.dev" },
    });

    await prisma.membership.upsert({
      where: { userId_orgId: { userId: user.id, orgId: org.id } },
      update: {},
      create: { userId: user.id, orgId: org.id, role: "ORG_ADMIN" },
    });

    // 3. Ubicaciones
    const ubicacionesData = ["Maternidad", "Finanzas", "HODOM", "Urgencias", "Farmacia", "Laboratorio", "Dirección", "Recursos Humanos"];
    const ubicaciones: Record<string, { id: number }> = {};
    for (const nombre of ubicacionesData) {
      const ub = await prisma.ubicacion.upsert({
        where: { orgId_nombre: { orgId: org.id, nombre } },
        update: {},
        create: { nombre, orgId: org.id },
      });
      ubicaciones[nombre] = ub;
    }

    // 4. Empleados
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
        create: { rut: e.rut, nombre: e.nombre, correo: e.correo, cargo: e.cargo, ubicacionId: ubicaciones[e.ubicacion].id, orgId: org.id },
      });
      empleados[e.nombre] = emp;
    }

    // 5. Equipos
    const equiposData = [
      { tipo: "PC" as const, marca: "HP", modelo: "ProDesk 400 G7", numeroSerie: "CND1234ABC", ip: "10.4.46.101", hostname: "PC-MAT-01", so: "Windows 11 Pro", ram: "8 GB", disco: "256 GB SSD", procesador: "Intel i5-10400", estado: "ACTIVO" as const, ubicacion: "Maternidad", empleado: "María González" },
      { tipo: "PC" as const, marca: "Lenovo", modelo: "ThinkCentre M70q", numeroSerie: "PF3K789D", ip: "10.4.46.102", hostname: "PC-FIN-01", so: "Windows 11 Pro", ram: "16 GB", disco: "512 GB SSD", procesador: "Intel i7-10700", estado: "ACTIVO" as const, ubicacion: "Finanzas", empleado: "Juan Pérez" },
      { tipo: "IMPRESORA" as const, marca: "HP", modelo: "LaserJet M507", numeroSerie: "VNB4501XYZ", ip: "10.4.46.201", hostname: "IMP-MAT-01", estado: "ACTIVO" as const, ubicacion: "Maternidad", empleado: null },
      { tipo: "IMPRESORA" as const, marca: "Brother", modelo: "MFC-L2710DW", numeroSerie: "U64582AW", ip: "10.4.46.202", hostname: "IMP-FIN-01", estado: "ACTIVO" as const, ubicacion: "Finanzas", empleado: null },
      { tipo: "PC" as const, marca: "HP", modelo: "ProDesk 400 G6", numeroSerie: "CND5678DEF", ip: "10.4.46.103", hostname: "PC-URG-01", so: "Windows 10 Pro", ram: "8 GB", disco: "256 GB SSD", procesador: "Intel i5-9400", estado: "EN_REPARACION" as const, ubicacion: "Urgencias", empleado: "Ana Martínez" },
      { tipo: "NOTEBOOK" as const, marca: "Lenovo", modelo: "ThinkPad L14", numeroSerie: "PF5L012G", ip: "10.4.46.150", hostname: "NB-DIR-01", so: "Windows 11 Pro", ram: "16 GB", disco: "512 GB SSD", procesador: "Intel i7-1165G7", estado: "ACTIVO" as const, ubicacion: "Dirección", empleado: "Patricia Soto" },
      { tipo: "IMPRESORA" as const, marca: "HP", modelo: "LaserJet M404", numeroSerie: "VNB6789GHI", ip: "10.4.46.203", hostname: "IMP-URG-01", estado: "ACTIVO" as const, ubicacion: "Urgencias", empleado: null },
      { tipo: "PC" as const, marca: "HP", modelo: "ProDesk 400 G7", numeroSerie: "CND9012JKL", ip: "10.4.46.104", hostname: "PC-FAR-01", so: "Windows 11 Pro", ram: "8 GB", disco: "256 GB SSD", procesador: "Intel i5-10400", estado: "ACTIVO" as const, ubicacion: "Farmacia", empleado: "Carlos Rojas" },
      { tipo: "MONITOR" as const, marca: "Samsung", modelo: "24\" FHD S24R350", numeroSerie: "HXAY300123", estado: "ACTIVO" as const, ubicacion: "Finanzas", empleado: "Juan Pérez" },
      { tipo: "PC" as const, marca: "HP", modelo: "ProDesk 400 G5", numeroSerie: "CND3456MNO", ip: "10.4.46.105", hostname: "PC-LAB-01", so: "Windows 10 Pro", ram: "4 GB", disco: "500 GB HDD", procesador: "Intel i3-8100", estado: "DADO_DE_BAJA" as const, ubicacion: "Laboratorio", empleado: null },
      { tipo: "IMPRESORA" as const, marca: "HP", modelo: "LaserJet M507", numeroSerie: "VNB1122PQR", ip: "10.4.46.204", hostname: "IMP-HOD-01", estado: "ACTIVO" as const, ubicacion: "HODOM", empleado: null },
      { tipo: "PC" as const, marca: "Lenovo", modelo: "ThinkCentre M90q", numeroSerie: "PF7M345H", ip: "10.4.46.106", hostname: "PC-RRH-01", so: "Windows 11 Pro", ram: "16 GB", disco: "256 GB SSD", procesador: "Intel i5-10500", estado: "ACTIVO" as const, ubicacion: "Recursos Humanos", empleado: "Roberto Díaz" },
    ];

    const equiposMap: Record<string, { id: number }> = {};
    for (const eq of equiposData) {
      const equipo = await prisma.equipo.upsert({
        where: { orgId_numeroSerie: { orgId: org.id, numeroSerie: eq.numeroSerie } },
        update: {},
        create: {
          tipo: eq.tipo, marca: eq.marca, modelo: eq.modelo, numeroSerie: eq.numeroSerie,
          ip: (eq as Record<string, unknown>).ip as string ?? null, hostname: (eq as Record<string, unknown>).hostname as string ?? null,
          so: (eq as Record<string, unknown>).so as string ?? null, ram: (eq as Record<string, unknown>).ram as string ?? null,
          disco: (eq as Record<string, unknown>).disco as string ?? null, procesador: (eq as Record<string, unknown>).procesador as string ?? null,
          estado: eq.estado, ubicacionId: ubicaciones[eq.ubicacion].id,
          empleadoId: eq.empleado ? empleados[eq.empleado].id : null, orgId: org.id,
        },
      });
      if ((eq as Record<string, unknown>).hostname) equiposMap[(eq as Record<string, unknown>).hostname as string] = equipo;
    }

    // 6. Insumos
    const insumosData = [
      { modelo: "W9004MC", tipo: "TONER" as const, marca: "HP", stockActual: 3, stockMinimo: 2 },
      { modelo: "TN-1060", tipo: "TONER" as const, marca: "Brother", stockActual: 1, stockMinimo: 2 },
      { modelo: "CF258A", tipo: "TONER" as const, marca: "HP", stockActual: 5, stockMinimo: 3 },
      { modelo: "CF226A", tipo: "TONER" as const, marca: "HP", stockActual: 0, stockMinimo: 2 },
      { modelo: "DR-1060", tipo: "DRUM" as const, marca: "Brother", stockActual: 2, stockMinimo: 1 },
      { modelo: "CF259A", tipo: "TONER" as const, marca: "HP", stockActual: 4, stockMinimo: 3 },
      { modelo: "TN-2420", tipo: "TONER" as const, marca: "Brother", stockActual: 0, stockMinimo: 2 },
      { modelo: "W1106A", tipo: "TONER" as const, marca: "HP", stockActual: 6, stockMinimo: 3 },
    ];
    for (const ins of insumosData) {
      await prisma.insumo.upsert({
        where: { orgId_modelo: { orgId: org.id, modelo: ins.modelo } },
        update: {},
        create: { ...ins, orgId: org.id },
      });
    }

    // 7. Tickets (delete existing first to avoid duplicates on re-seed)
    await prisma.ticket.deleteMany({ where: { orgId: org.id } });
    const ticketsData = [
      { titulo: "PC no enciende", descripcion: "El equipo no responde al botón de encendido", prioridad: "ALTA" as const, estado: "ABIERTO" as const, empleado: "Ana Martínez", equipo: "PC-URG-01" },
      { titulo: "Impresora atascada", descripcion: "La impresora Brother tiene papel atascado frecuentemente", prioridad: "MEDIA" as const, estado: "EN_PROGRESO" as const, empleado: "Juan Pérez", equipo: "IMP-FIN-01" },
      { titulo: "Solicitar tóner", descripcion: "Se acabó el tóner de la impresora de Maternidad", prioridad: "BAJA" as const, estado: "RESUELTO" as const, empleado: "María González", equipo: "IMP-MAT-01" },
      { titulo: "Sin acceso a red", descripcion: "No puedo acceder al sistema desde mi equipo", prioridad: "CRITICA" as const, estado: "ABIERTO" as const, empleado: "Carlos Rojas", equipo: "PC-FAR-01" },
      { titulo: "Monitor con líneas", descripcion: "El monitor muestra líneas horizontales", prioridad: "MEDIA" as const, estado: "ABIERTO" as const, empleado: "Juan Pérez", equipo: null },
    ];
    for (const t of ticketsData) {
      await prisma.ticket.create({
        data: {
          titulo: t.titulo, descripcion: t.descripcion, prioridad: t.prioridad, estado: t.estado,
          empleadoId: empleados[t.empleado].id, equipoId: t.equipo ? equiposMap[t.equipo]?.id ?? null : null, orgId: org.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Seed completed",
      data: { org: org.name, ubicaciones: ubicacionesData.length, empleados: empleadosData.length, equipos: equiposData.length, insumos: insumosData.length, tickets: ticketsData.length },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
