// Formas crudas que llegan del backend para module. Nada de este archivo se usa
// en un componente: todo pasa antes por `ModuleMapper`.
//
// `content_type` es la misma unión que el modelo interno: se importa de
// `@lesson/models/lesson.interface` para que exista una sola fuente.

import { LessonContentType } from '@lesson/models/lesson.interface';

export interface ModuleResponseDto {
  id        : string;
  id_course : string;
  title     : string;
  unit      : number;
  lessons   : string[];
}

// `content_type` y `duration_minutes` son opcionales: el backend todavía no
// los manda (ver SPEC 11). El mapper los resuelve a `null`.
export interface ModulePopulatedResponseDto {
  id        : string;
  id_course : string;
  title     : string;
  unit      : number;
  lessons   : {
    id                : string;
    title             : string;
    content_type     ?: LessonContentType | null;
    duration_minutes ?: number | null;
  }[];
}
