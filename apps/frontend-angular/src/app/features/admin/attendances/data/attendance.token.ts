// Token de inyección del servicio de asistencias (frontera admin frontend).
// Sin HTTP, storage ni claves. Implementación en memoria en
// attendance-mock.service.ts. Ver spec admin-attendances-frontend.
import { InjectionToken } from '@angular/core';
import { AttendanceService } from '../models/attendance.types';

// ponytail: token único para inyectar la implementación en memoria.
export const ATTENDANCE_SOURCE = new InjectionToken<AttendanceService>('ATTENDANCE_SOURCE');