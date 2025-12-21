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
    *   **Configuración:** Gestión de días festivos globales y configuración de jornadas.
    *   **Informes:** Acceso a informes de toda la empresa.

## 3. Funcionalidades Detalladas

### 3.1. Autenticación y Perfil (`AuthContext`, `AuthScreen`)
*   **Login:** Autenticación mediante email/password vía Supabase Auth.
*   **Estructura de Saldos y Balances:**
    *   El sistema gestiona múltiples bolsas de días con reinicio anual (1 de Enero):
        1.  **Vacaciones Totales:** Cantidad base (ej. 22 o 23 días laborables).
        2.  **Sub-límite Jornada Intensiva:** De las vacaciones totales, **exactamente 17 días** deben consumirse en días designados como "Jornada Intensiva" (Viernes y Verano). El resto se disfrutan en Jornada Completa.
        3.  **Asuntos Propios:** Bolsa independiente (**3 días por defecto**) a libre disposición.
        4.  **Balance Año Anterior:** Días de vacaciones no disfrutados el año previo, disponibles para gastar.
*   **Sesión:** Persistencia de sesión gestionada por `AuthProvider`.

### 3.2. Gestión de Usuarios (`UserManagement`)
*   **Alcance:** Exclusivo para rol `rrhh`.
*   **CRUD de Usuarios:** Alta, Baja y Modificación de usuarios, roles, equipos y saldos iniciales (Vacaciones y Asuntos Propios).
*   **Listado:** Tabla con filtrado y paginación.

### 3.3. Gestión de Equipos (`TeamManagement`)
*   **Alcance:** Exclusivo para rol `rrhh`.
*   **Funcionalidad:** Creación de equipos y asignación de Responsables.

### 3.4. Gestión de Vacaciones y Ausencias (`useLeaveRequests`)
*   **Tipos de Solicitud y Flujos:**
    *   **Vacaciones:**
        *   Requieren aprobación del Responsable.
        *   **Validación Estricta:** El sistema valida contra el calendario laboral. Impide solicitar más días de "Jornada Completa" de los disponibles (Total - 17). Obliga a consumir 17 días en periodo de jornada intensiva.
    *   **Asuntos Propios:**
        *   Requieren aprobación.
        *   Se descuentan de su propia bolsa independiente (`personal_days_balance`).
    *   **Baja Médica (Enfermedad):**
        *   **Auto-aprobación:** La solicitud se crea automáticamente con estado `aprobada`.
        *   Se registra en el calendario y se notifica al responsable.
        *   No consume saldo de vacaciones ni asuntos propios.
        *   *(Mejora Futura: Flujo de validación de justificante médico por RRHH).*
*   **Validaciones Generales:**
    *   Comprobación de solapamiento de fechas (Ya implementado).
    *   Comprobación de saldo suficiente según el tipo de día y bolsa.

### 3.5. Gestión de Calendario y Festivos (`HolidayManager`)
*   **Configuración Avanzada de Jornada:**
    *   Además de Festivos (Nacionales, Autonómicos, Locales, Empresa), el calendario define la tipología del día laborable:
        *   **Jornada Intensiva (7h):**
            *   **Regla Recurrente:** Todos los Viernes del año.
            *   **Temporada de Verano:** Periodo definido por rangos (ej: 15 Junio - 15 Septiembre).
            *   **Días Sueltos (Ad-hoc):** Días específicos marcados manualmente (ej: vísperas de festivos) para ajustar horas de convenio.
        *   **Jornada Completa:** Resto de días laborables.
*   **Festivos de Empresa:** Días específicos marcados por la empresa para ajustar el convenio anual de horas.

### 3.6. Dashboard y Reportes
*   **Dashboard Personal:** Resumen visual de balances desglosados (Vacaciones Restantes, Días Intensivos Restantes, Asuntos Propios Restantes).
*   **Informe Mensual:** Matriz de visualización de ausencias.

### 3.7. Notificaciones
*   Sistema híbrido (In-App + DB) para avisos de solicitudes y estados.

## 4. Estructura de Datos (Supabase)
*   `profiles`: Usuarios extendidos. Se requiere migración para soportar el desglose de saldos.
*   `teams`: Definición de equipos.
*   `leave_requests`: Registro de solicitudes.
*   `holidays`: Calendario laboral (Festivos).
*   `calendar_configs`: Configuración anual de periodos de jornada intensiva (Verano).
*   `special_workdays` (Nueva): Días laborables con horario especial (ej: intensiva suelta).

---

## 5. Roadmap de Implementación (Refactorización del Modelo de Negocio)

Dada la complejidad del cambio de lógica de negocio, la implementación se realizará en 4 fases:

### Fase 1: Preparación del Terreno (Calendario Inteligente)
*   [ ] Crear tablas `calendar_configs` (rangos verano) y `special_workdays` (días sueltos).
*   [ ] Actualizar `CalendarView` para visualizar días intensivos (recurrente, verano y manuales).
*   [ ] Crear herramienta de gestión (UI) para marcar "Días Intensivos Sueltos".
*   [ ] Crear servicio `CalendarService` capaz de centralizar toda esta lógica y determinar el tipo de día.

### Fase 2: Separación de Tipos de Solicitud (Bajas y Asuntos)
*   [ ] Implementar bolsa independiente para "Asuntos Propios" en la UI y BD.
*   [ ] Modificar flujo de "Bajas Médicas": Eliminar requisito de aprobación (Auto-aprobación o estado 'Notificado').

### Fase 3: Validación Informativa (Soft Enforcement)
*   [ ] Implementar lógica de cálculo al solicitar vacaciones: Desglosar cuántos días son intensivos y cuántos completos en el rango seleccionado.
*   [ ] Mostrar aviso en el modal de solicitud: "Estás gastando X días intensivos y Y completos".

### Fase 4: Validación Estricta (Hard Enforcement)
*   [ ] Migración de BBDD: Actualizar `profiles` para guardar saldos desglosados (`vacation_intensive_consumed`, `vacation_full_consumed`).
*   [ ] Activar bloqueo en `leaveService`: Impedir crear solicitud si viola la regla de los 17 días intensivos.
*   [ ] Implementar lógica de reinicio anual (Carry-over).
