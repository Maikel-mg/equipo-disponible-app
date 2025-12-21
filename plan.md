# Plan de Trabajo - ipk-vacaciones

## Fase 1: Calendario Inteligente ✅
- [x] Crear tablas `calendar_configs` y `special_workdays`.
- [x] Crear `CalendarService.ts` con jerarquía de tipos de día.
- [x] Implementar `IntensiveManager.tsx` (Gestión de Verano y Días Especiales).
- [x] Integrar `IntensiveManager` en `HolidayManager.tsx` mediante pestañas.
- [x] Actualizar `CalendarView.tsx` y `CalendarFilters.tsx` para visualizar jornada intensiva.
- [x] Configurar rutas y barra lateral para acceder al Calendario Laboral.

---

## Fase 2: Separación de Tipos de Solicitud (Bajas y Asuntos) ✅

### Historia 2.1: Gestión de Bolsa de Asuntos Propios (DB & Admin) ✅
- [x] Ejecutar SQL para añadir `personal_days_balance` a la tabla `profiles`.
- [x] Actualizar `src/models/types.ts` y `src/integrations/supabase/types.ts`.
- [x] Modificar `CreateUserForm.tsx` para incluir el campo de Asuntos Propios (default 3).
- [x] Modificar `UserEditForm.tsx` para permitir la edición del saldo de Asuntos Propios.

### Historia 2.2: Lógica de Consumo (Service) ✅
- [x] Modificar `leaveService.ts` para validar saldo de Asuntos Propios antes de crear solicitud.
- [x] Modificar `leaveService.ts` para descontar del saldo correcto (`personal_days_balance`) al aprobar.

### Historia 2.3: Automatización de Bajas (Service) ✅
- [x] Modificar `leaveService.ts` para que las solicitudes de tipo 'enfermedad' se creen directamente como 'aprobada'.
- [x] Asegurar que las bajas no descuentan de ningún saldo de vacaciones/asuntos.

### Historia 2.4: Visualización del Empleado (UI) ✅
- [x] Actualizar `Dashboard.tsx` para mostrar el desglose de saldos (Vacaciones vs Asuntos Propios).
- [ ] (Opcional) Mostrar el estado "Auto-aprobado" o similar en la tabla de solicitudes para bajas.

---

## Fase 3: Validación Informativa (Cálculo de Consumo) ✅
- [x] Implementar visualización de consumo (intensivos vs completos) en el modal de solicitud.
- [x] Integrar `CalendarService` en el formulario de solicitud para cálculos en tiempo real.

## Fase 4: Validación Estricta (Bloqueo de Solicitudes) ✅
- [x] Ejecutar SQL para añadir contadores de consumo (`vacation_full_consumed`, `vacation_intensive_consumed`).
- [x] Actualizar `src/models/types.ts` y tipos de Supabase.
- [x] Modificar `leaveService.ts` para aplicar el bloqueo estricto en `createRequest`.
- [x] Modificar `leaveService.ts` para actualizar contadores desglosados en `updateRequest`.
- [x] Actualizar `Dashboard.tsx` para mostrar el saldo desglosado (Completa vs Intensiva).

---
**Proyecto de Refactorización de Calendario y Saldos Completado con éxito.**
