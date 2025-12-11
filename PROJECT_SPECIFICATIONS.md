# Documento de Especificaciones Funcionales: ipk-vacaciones

## 1. Visión General
`ipk-vacaciones` es una aplicación web SPA (Single Page Application) diseñada para la gestión integral de vacaciones y ausencias de empleados. Permite a los empleados solicitar días libres, a los responsables gestionar estas solicitudes y al departamento de RRHH administrar la estructura organizativa (usuarios y equipos).

**Tecnologías Clave:** React, TypeScript, Tailwind CSS, Shadcn/UI, Supabase (Auth & Database), React Query.

## 2. Roles y Permisos
El sistema define tres niveles de acceso, gestionados a través de la tabla `profiles` en Supabase.

*   **Empleado (`empleado`):**
    *   Puede solicitar vacaciones y bajas.
    *   Puede ver su propio historial, balance de días y calendario de equipo.
    *   Puede ver notificaciones personales.
*   **Responsable (`responsable`):**
    *   Hereda permisos de empleado.
    *   **Gestión de Solicitudes:** Puede aprobar o rechazar solicitudes de los miembros de su equipo.
    *   **Informes:** Acceso a informes mensuales de su equipo.
*   **RRHH (`rrhh`):**
    *   Acceso total al sistema (Superadmin).
    *   **Gestión Global:** Puede gestionar todos los usuarios y equipos.
    *   **Configuración:** Gestión de días festivos globales.
    *   **Informes:** Acceso a informes de toda la empresa.

## 3. Funcionalidades Detalladas

### 3.1. Autenticación y Perfil (`AuthContext`, `AuthScreen`)
*   **Login:** Autenticación mediante email/password vía Supabase Auth.
*   **Registro Automático:** Al iniciar sesión por primera vez, se crea automáticamente un perfil de usuario con:
    *   Rol por defecto: `empleado`.
    *   Balance inicial: 22 días de vacaciones, 3 días de asuntos propios/enfermedad.
*   **Sesión:** Persistencia de sesión gestionada por `AuthProvider`.

### 3.2. Gestión de Usuarios (`UserManagement`)
*   **Alcance:** Exclusivo para rol `rrhh`.
*   **CRUD de Usuarios:**
    *   **Crear:** Alta de usuarios en Supabase Auth y creación de perfil asociado. Asignación de rol, equipo y balances iniciales.
    *   **Editar:** Modificación de datos personales, rol, asignación a equipos y ajuste manual de balances de días.
    *   **Eliminar:** Baja lógica o física del usuario.
*   **Listado:** Tabla con filtrado y paginación de todos los empleados.

### 3.3. Gestión de Equipos (`TeamManagement`)
*   **Alcance:** Exclusivo para rol `rrhh`.
*   **Funcionalidad:**
    *   Creación de departamentos/equipos.
    *   Asignación de un **Responsable** (Manager) a cada equipo.
    *   Visualización de miembros asignados por equipo.

### 3.4. Gestión de Vacaciones y Ausencias (`useLeaveRequests`)
*   **Solicitud (Empleados):**
    *   Formulario (`NewRequestModal`) para seleccionar rango de fechas y tipo de ausencia (Vacaciones, Enfermedad, Asuntos Propios, etc.).
    *   Validación de días disponibles antes de enviar.
*   **Flujo de Aprobación:**
    *   Las solicitudes nacen en estado `pendiente`.
    *   Responsables/RRHH visualizan solicitudes pendientes en `LeaveRequestsPage`.
    *   Acciones: `Aprobar` o `Rechazar`.
    *   **Lógica de Negocio:** Al aprobar, se descuentan los días del balance del empleado (**Nota:** Se detectó un bug crítico donde se descuentan al aprobador en lugar del solicitante).
*   **Calendario (`CalendarView`):**
    *   Visualización mensual de ausencias propias y festivos.
    *   Filtros por equipo (para responsables).

### 3.5. Gestión de Festivos (`HolidayManager`)
*   **Alcance:** Roles `rrhh` y `responsable` (según configuración).
*   **Funcionalidad:**
    *   Alta/Baja/Modificación de días festivos corporativos o nacionales.
    *   Estos días no computan como días gastados en las solicitudes de vacaciones.
    *   Visualización destacada en el Dashboard.

### 3.6. Dashboard y Reportes
*   **Dashboard Personal (`Dashboard`):**
    *   Resumen visual: Días disponibles, solicitudes pendientes, próximos festivos.
    *   "Acciones Rápidas" para navegación frecuente.
    *   Estadísticas personales.
*   **Informe Mensual (`MonthlyReport`):**
    *   Vista de cuadrícula (Matriz Empleados x Días del Mes).
    *   Visualización de códigos de ausencia (V=Vacaciones, E=Enfermedad, etc.).
    *   Filtrado automático: Responsables ven solo su equipo; RRHH ve toda la empresa.
    *   Cálculo de totales por empleado en el mes seleccionado.

### 3.7. Notificaciones (`NotificationCenter`)
*   **Sistema Híbrido:**
    1.  **Dinámicas:** Se generan en tiempo real (ej. "Tienes 3 solicitudes pendientes" para managers, "Festivo en 2 días").
    2.  **Persistentes:** Almacenadas en base de datos (`notifications` table) para eventos históricos o asíncronos.
*   **Funcionalidad:** Indicador de no leídas, marcar como leída, listado cronológico.

## 4. Estructura de Datos (Supabase)
*   `profiles`: Usuarios extendidos (rol, balances, equipo).
*   `teams`: Definición de equipos y sus líderes.
*   `leave_requests`: Registro central de solicitudes (fechas, estado, usuario).
*   `holidays`: Calendario laboral.
*   `notifications`: Buzón de notificaciones de usuario.

***

### Próximos Pasos Recomendados (Basado en análisis)
1.  **Corrección de Bug Crítico:** Arreglar la lógica de descuento de días en `useLeaveRequests.ts` (actualmente descuenta al aprobador en lugar del solicitante).
2.  **Validaciones:** Implementar validación para evitar solapamiento de fechas en solicitudes.
3.  **Notificaciones por Email:** Integrar Supabase Edge Functions para enviar correos al recibir/aprobar solicitudes.
4.  **Auditoría:** Añadir tabla de logs para registrar quién aprobó/rechazó qué y cuándo.