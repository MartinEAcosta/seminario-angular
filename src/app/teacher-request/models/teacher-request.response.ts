// Forma cruda que llega del backend para teacher-request. Nada de este archivo
// se usa en un componente: todo pasa antes por `TeacherRequestMapper`.
//
// Las fechas se tipan `string`: `JSON.parse` no construye `Date`.
//
// `status` y `experience_level` son las mismas uniones que el modelo interno:
// se importan de `teacher-request.model` para que exista una sola fuente.

import { TeacherExperienceLevel, TeacherRequestStatus } from './teacher-request.model';

export interface TeacherRequestResponseDto {
  id                : string;
  id_user           : string;
  status            : TeacherRequestStatus;
  category_ids      : string[];
  about_you         : string;
  experience_level  : TeacherExperienceLevel;
  course_title      : string;
  course_summary    : string;
  portfolio_url    ?: string | null;
  rejection_reason ?: string | null;
  created_at        : string;
  reviewed_at      ?: string | null;
}
