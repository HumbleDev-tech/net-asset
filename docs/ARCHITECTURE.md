# NetAsset — Arquitectura del Sistema

> Documento de referencia. Toda decisión de diseño debe respetar lo definido aquí.
> Última actualización: 2026-05-15

---

## 1. Visión del Producto

**NetAsset** es un sistema **multi-tenant** de gestión de activos TI (ITAM) y mesa de ayuda (HelpDesk).

Cada **organización** (hospital, escuela, empresa) tiene su propio espacio aislado con:
- Su inventario de equipos
- Sus departamentos/áreas
- Sus empleados (usuarios del sistema)
- Sus insumos y stock
- Sus tickets de soporte
- Sus administradores y técnicos

> **Analogía:** Piensa en Slack — cada empresa tiene su "workspace" separado.
> NetAsset funciona igual: cada organización tiene su "workspace" con datos 100% separados.

---

## 2. Modelo Multi-Tenant

### Estrategia: Tenant por fila (Row-Level Isolation)

Usamos **una sola base de datos** donde cada registro tiene un `orgId` que lo vincula
a una organización. Es la estrategia más usada en SaaS porque:

- ✅ Gratis (una sola BD)
- ✅ Simple de implementar
- ✅ Escala bien hasta miles de organizaciones
- ✅ Fácil de mantener

### Flujo de acceso

```
Usuario se loguea
    ↓
¿Tiene cuenta? → No → Registro → Crear Org o Unirse a una
    ↓ Sí
¿A qué org pertenece? → Se carga su orgId
    ↓
TODAS las queries filtran por orgId automáticamente
    ↓
El usuario SOLO ve datos de su organización
```

---

## 3. Roles y Permisos

### 3.1 Roles del Sistema

| Rol | Scope | Descripción |
|-----|-------|-------------|
| `SUPER_ADMIN` | Global | Tú (el dueño de la plataforma). Puede ver todas las orgs. Solo para administración interna. |
| `ORG_ADMIN` | Organización | Administrador de una organización. Puede gestionar todo dentro de su org. |
| `TECNICO` | Organización | Técnico de soporte. Puede gestionar equipos, insumos, tickets. No puede gestionar usuarios ni configurar la org. |
| `USUARIO` | Organización | Empleado regular. Solo puede ver sus equipos asignados y crear tickets de soporte. |

### 3.2 Matriz de Permisos

| Acción | SUPER_ADMIN | ORG_ADMIN | TECNICO | USUARIO |
|--------|:-----------:|:---------:|:-------:|:-------:|
| Ver dashboard | ✅ | ✅ | ✅ | ❌ |
| Gestionar equipos (CRUD) | ✅ | ✅ | ✅ | ❌ |
| Ver equipos propios | ✅ | ✅ | ✅ | ✅ |
| Gestionar insumos | ✅ | ✅ | ✅ | ❌ |
| Gestionar usuarios de la org | ✅ | ✅ | ❌ | ❌ |
| Crear tickets | ✅ | ✅ | ✅ | ✅ |
| Resolver tickets | ✅ | ✅ | ✅ | ❌ |
| Ver todos los tickets | ✅ | ✅ | ✅ | ❌ |
| Ver solo sus tickets | — | — | — | ✅ |
| Configurar organización | ✅ | ✅ | ❌ | ❌ |
| Invitar miembros a la org | ✅ | ✅ | ❌ | ❌ |
| Ver todas las organizaciones | ✅ | ❌ | ❌ | ❌ |

### 3.3 Lógica de acceso (pseudocódigo)

```typescript
// Middleware que se ejecuta en CADA request al dashboard
function authMiddleware(request) {
  const session = await getSession(request);

  if (!session) redirect("/login");

  // Obtener la membresía activa del usuario
  const membership = await getMembership(session.userId, session.activeOrgId);

  if (!membership) redirect("/select-org"); // No pertenece a esta org

  // Inyectar en el contexto
  request.orgId = membership.orgId;
  request.role = membership.role;
}

// Ejemplo de query protegida
async function getEquipos(orgId: string) {
  return prisma.equipo.findMany({
    where: { orgId }, // ← SIEMPRE filtrar por orgId
  });
}
```

---

## 4. Modelo de Datos (Schema Prisma)

### 4.1 Diagrama de Entidades

```
┌─────────────────────────────────────────────────────────┐
│                     CAPA GLOBAL                         │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Account  │───│   User       │───│  Membership   │   │
│  │ (OAuth)   │   │ (Auth)       │   │ (User↔Org)    │   │
│  └──────────┘    └──────────────┘    └──────┬───────┘   │
│                                             │           │
│                                    ┌────────┴────────┐  │
│                                    │  Organization   │  │
│                                    │  (El Tenant)    │  │
│                                    └────────┬────────┘  │
└─────────────────────────────────────────────┼───────────┘
                                              │
┌─────────────────────────────────────────────┼───────────┐
│              CAPA POR ORGANIZACIÓN          │           │
│                                             │           │
│  ┌───────────┐  ┌─────────┐  ┌──────────┐  │           │
│  │ Ubicacion │  │ Empleado│  │  Equipo   │  │           │
│  │ (Depto)   │  │ (Staff) │  │  (Asset)  │  │           │
│  └─────┬─────┘  └────┬────┘  └────┬─────┘  │           │
│        │             │            │         │           │
│        └─────────────┼────────────┘         │           │
│                      │                      │           │
│  ┌───────────┐  ┌────┴────┐  ┌───────────┐  │           │
│  │  Insumo   │  │ Ticket  │  │EquipoIns. │  │           │
│  │ (Supply)  │  │(Support)│  │(Eq↔Supply) │  │           │
│  └─────┬─────┘  └─────────┘  └───────────┘  │           │
│        │                                    │           │
│  ┌─────┴──────┐                             │           │
│  │Movimiento  │                             │           │
│  │(Stock Log) │                             │           │
│  └────────────┘                             │           │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Separación importante: User vs Empleado

| Concepto | `User` | `Empleado` |
|----------|--------|-----------|
| **¿Qué es?** | Persona que se loguea en la plataforma | Persona registrada en una organización |
| **¿Tiene login?** | Sí (email + OAuth) | No necesariamente |
| **Scope** | Global (puede pertenecer a varias orgs) | Local a una organización |
| **Ejemplo** | Tú, el admin de TI que se loguea | "María González", enfermera del hospital |
| **Tabla** | `User` | `Empleado` |

> **¿Por qué separar?** Porque en un hospital con 500 empleados, quizás solo 3-5 personas del equipo de TI necesitan loguearse en NetAsset. Los demás 495 empleados solo existen como registros para asignarles equipos y que puedan tener tickets a su nombre.

### 4.3 Schema Prisma Completo

> **NOTA:** Este es el schema objetivo. Se implementa progresivamente por fases.

```prisma
// ══════════════════════════════════════════════════════════
// CAPA GLOBAL — Auth & Multi-Tenant
// ══════════════════════════════════════════════════════════

// Organización = El tenant. Todo dato de negocio pertenece a una org.
model Organization {
  id          String   @id @default(cuid())
  name        String                         // "Hospital Regional", "Escuela Nº5"
  slug        String   @unique               // "hospital-regional" (para URLs)
  type        OrgType  @default(EMPRESA)     // Hospital, Escuela, Empresa, etc.
  logoUrl     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones globales
  memberships Membership[]

  // Relaciones de negocio (todo lo que pertenece a esta org)
  ubicaciones Ubicacion[]
  empleados   Empleado[]
  equipos     Equipo[]
  insumos     Insumo[]
  tickets     Ticket[]
}

// User = Persona con cuenta en la plataforma (puede loguearse)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Auth (NextAuth)
  accounts      Account[]
  sessions      Session[]

  // Multi-tenant: un User puede pertenecer a varias orgs
  memberships   Membership[]
}

// Membership = Vínculo User ↔ Organization con rol
model Membership {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  role      Role     @default(TECNICO)
  createdAt DateTime @default(now())

  @@unique([userId, orgId]) // Un user solo puede tener un rol por org
}

// NextAuth — Cuentas OAuth (GitHub, Google)
model Account {
  id                String  @id @default(cuid())
  userId            String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  @@unique([provider, providerAccountId])
}

// NextAuth — Sesiones
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires      DateTime
  activeOrgId  String?  // ← Org activa en esta sesión
}

// ══════════════════════════════════════════════════════════
// CAPA POR ORGANIZACIÓN — Datos de Negocio
// ══════════════════════════════════════════════════════════
// REGLA: Toda tabla de negocio DEBE tener orgId + relación con Organization

// Ubicaciones (Departamentos / Áreas dentro de la org)
model Ubicacion {
  id        Int          @id @default(autoincrement())
  nombre    String                       // "Maternidad", "Contabilidad", "Sala 3B"
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  empleados Empleado[]
  equipos   Equipo[]

  @@unique([orgId, nombre]) // Nombre único DENTRO de cada org
}

// Empleados (Personal de la organización — NO necesitan login)
model Empleado {
  id          Int          @id @default(autoincrement())
  rut         String?                    // Identificador local (RUT, DNI, etc.)
  nombre      String
  correo      String?
  telefono    String?
  cargo       String?
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  ubicacionId Int
  ubicacion   Ubicacion    @relation(fields: [ubicacionId], references: [id])
  equipos     Equipo[]
  tickets     Ticket[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([orgId, rut]) // RUT único DENTRO de cada org
}

// Equipos (PCs, Impresoras, Monitores, etc.)
model Equipo {
  id          Int          @id @default(autoincrement())
  tipo        TipoEquipo
  marca       String?
  modelo      String?
  numeroSerie String?
  ip          String?
  hostname    String?
  macAddress  String?                    // Dirección MAC
  so          String?                    // Sistema operativo
  ram         String?                    // Ej: "8 GB"
  disco       String?                    // Ej: "256 GB SSD"
  procesador  String?                    // Ej: "Intel i5-10400"
  estado      EstadoEquipo @default(ACTIVO)
  fechaCompra DateTime?                 // Cuándo se compró
  garantia    DateTime?                 // Fecha fin garantía
  notas       String?
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  ubicacionId Int
  ubicacion   Ubicacion    @relation(fields: [ubicacionId], references: [id])
  empleadoId  Int?                      // Empleado asignado (puede ser null)
  empleado    Empleado?    @relation(fields: [empleadoId], references: [id])
  insumos     EquipoInsumo[]
  tickets     Ticket[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([orgId, numeroSerie]) // Serie única DENTRO de cada org
}

// Insumos (Tóners, Tintas, Drums, etc.)
model Insumo {
  id          Int          @id @default(autoincrement())
  modelo      String
  tipo        TipoInsumo
  marca       String?
  stockActual Int          @default(0)
  stockMinimo Int          @default(2)
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  equipos     EquipoInsumo[]
  movimientos MovimientoInsumo[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([orgId, modelo]) // Modelo único DENTRO de cada org
}

// Relación Equipo ↔ Insumo
model EquipoInsumo {
  id        Int    @id @default(autoincrement())
  equipoId  Int
  equipo    Equipo @relation(fields: [equipoId], references: [id], onDelete: Cascade)
  insumoId  Int
  insumo    Insumo @relation(fields: [insumoId], references: [id], onDelete: Cascade)

  @@unique([equipoId, insumoId])
}

// Movimientos de Insumos (Historial de stock)
model MovimientoInsumo {
  id        Int            @id @default(autoincrement())
  insumoId  Int
  insumo    Insumo         @relation(fields: [insumoId], references: [id], onDelete: Cascade)
  tipo      TipoMovimiento
  cantidad  Int
  nota      String?
  createdAt DateTime       @default(now())
}

// Tickets de Soporte (HelpDesk)
model Ticket {
  id          Int          @id @default(autoincrement())
  titulo      String
  descripcion String?
  prioridad   Prioridad    @default(MEDIA)
  estado      EstadoTicket @default(ABIERTO)
  empleadoId  Int                       // Empleado que reporta
  empleado    Empleado     @relation(fields: [empleadoId], references: [id])
  equipoId    Int?                      // Equipo relacionado (opcional)
  equipo      Equipo?      @relation(fields: [equipoId], references: [id])
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  closedAt    DateTime?
}

// ══════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════

enum OrgType {
  HOSPITAL
  CLINICA
  ESCUELA
  UNIVERSIDAD
  EMPRESA
  GOBIERNO
  ONG
  OTRO
}

enum Role {
  SUPER_ADMIN  // Dueño de la plataforma (tú)
  ORG_ADMIN    // Admin de una organización
  TECNICO      // Técnico de soporte
  USUARIO      // Empleado con acceso limitado
}

enum TipoEquipo {
  PC
  NOTEBOOK
  IMPRESORA
  MONITOR
  TELEFONO
  SERVIDOR
  SWITCH
  ROUTER
  TABLET
  OTRO
}

enum EstadoEquipo {
  ACTIVO
  EN_REPARACION
  DADO_DE_BAJA
  EN_BODEGA
  PRESTADO
}

enum TipoInsumo {
  TONER
  TINTA
  DRUM
  CABLE
  OTRO
}

enum TipoMovimiento {
  ENTRADA
  SALIDA
  AJUSTE
}

enum EstadoTicket {
  ABIERTO
  EN_PROGRESO
  RESUELTO
  CERRADO
}

enum Prioridad {
  BAJA
  MEDIA
  ALTA
  CRITICA
}
```

---

## 5. Estructura de URLs

```
/                              → Landing page (pública)
/login                         → Página de login (NextAuth)
/select-org                    → Seleccionar organización (si pertenece a varias)
/new-org                       → Crear nueva organización
/dashboard                     → Dashboard principal (requiere auth + org)
/dashboard/equipos             → Inventario de equipos
/dashboard/equipos/[id]        → Detalle de un equipo
/dashboard/insumos             → Inventario de insumos
/dashboard/empleados           → Personal de la organización (renombrado de "usuarios")
/dashboard/empleados/[id]      → Perfil de empleado (equipos asignados, tickets, etc.)
/dashboard/tickets             → Mesa de ayuda
/dashboard/tickets/[id]        → Detalle de un ticket
/dashboard/configuracion       → Config de la organización (solo ADMIN)
```

---

## 6. Reglas de Implementación

### R1: Siempre filtrar por orgId
```typescript
// ✅ CORRECTO
const equipos = await prisma.equipo.findMany({
  where: { orgId: session.activeOrgId },
});

// ❌ INCORRECTO — Expone datos de TODAS las organizaciones
const equipos = await prisma.equipo.findMany();
```

### R2: Validar pertenencia en mutaciones
```typescript
// Antes de editar, verificar que el recurso pertenece a la org del usuario
async function updateEquipo(equipoId: number, data: UpdateData, orgId: string) {
  const equipo = await prisma.equipo.findFirst({
    where: { id: equipoId, orgId }, // ← Doble check
  });
  if (!equipo) throw new Error("No encontrado o sin permisos");
  // ... actualizar
}
```

### R3: Restricción por rol en Server Actions
```typescript
// Decorador/wrapper para verificar permisos
async function requireRole(roles: Role[]) {
  const session = await getSession();
  const membership = await getMembership(session.userId, session.activeOrgId);
  if (!roles.includes(membership.role)) {
    throw new Error("Sin permisos para esta acción");
  }
  return { session, membership };
}

// Uso:
async function deleteEquipo(id: number) {
  const { membership } = await requireRole(["ORG_ADMIN", "TECNICO"]);
  // ... borrar equipo verificando orgId
}
```

### R4: Naming conventions
- **Tablas:** PascalCase singular (`Equipo`, `Empleado`, `Organization`)
- **Campos:** camelCase (`orgId`, `createdAt`, `stockActual`)
- **Enums:** UPPER_SNAKE_CASE (`ACTIVO`, `EN_REPARACION`)
- **Actions:** camelCase verbo (`getEquipos`, `createTicket`, `updateEmpleado`)

---

## 7. Cambios respecto al schema original

| Antes | Después | Razón |
|-------|---------|-------|
| `Usuario` | `Empleado` | Evitar confusión con `User` (auth). "Empleado" es más claro. |
| Sin `orgId` | Todo tiene `orgId` | Multi-tenancy: aislar datos por organización |
| `@unique` global | `@@unique([orgId, campo])` | Un modelo de tóner puede repetirse en otra org |
| Sin auth | `User` + `Account` + `Session` | NextAuth para login con OAuth |
| Sin roles | `Membership` con `Role` | Control de acceso por organización |
| Sin specs de equipo | `macAddress`, `so`, `ram`, `disco`, `procesador` | Más info por equipo asignado |
| Sin fecha compra | `fechaCompra`, `garantia` | Tracking del ciclo de vida del activo |

---

## 8. Fases de Implementación (Actualizado)

### Fase 1: Fundamentos + Multi-Tenant
1. ~~Conectar BD real (Neon)~~ ✅ Schema diseñado
2. Actualizar schema Prisma al nuevo modelo
3. Crear Server Actions con filtro por `orgId`
4. Seed script con 1 organización demo
5. Eliminar mock-data.ts

### Fase 2: Auth + CRUD + Roles
1. NextAuth (GitHub + Google)
2. Middleware de auth + org
3. Formularios CRUD para todas las entidades
4. Verificación de roles en cada acción
5. Página de selección/creación de org

### Fase 3: UX + Features avanzados
1. Detalle de empleado (equipos asignados, historial)
2. Detalle de equipo (specs, historial, insumos)
3. Dashboard con gráficos (Recharts)
4. Búsqueda global (⌘K)
5. Exportar CSV
6. Responsive mobile

### Fase 4: Deploy + Polish
1. Deploy en Vercel
2. BD en Neon (free tier)
3. Seed de datos demo
4. Landing page profesional
5. README con screenshots
