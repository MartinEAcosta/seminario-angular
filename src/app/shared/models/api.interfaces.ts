// Formas crudas que llegan del backend. Lo que vive acá es el DTO que viaja
// DENTRO de `data`; el sobre lo pone `ApiResponse<T>`, que los servicios
// escriben completo en cada `http.get<...>()` para que el contrato se lea en
// el lugar donde se hace la request.
//
// Nada de este archivo se usa en un componente: todo pasa antes por su mapper
// en `src/app/mappers/`.
//
// Las fechas se tipan `string`: `JSON.parse` no construye `Date`. El único
// lugar que construye `Date` es el mapper.

export interface ApiResponse<T> {
  ok   : boolean;
  data : T;
}

export interface ErrorResponse {
  ok     : boolean;
  status : number;
  error  : string;
}

// `T` es el tipo de UN item de la página; `items` ya es la lista.
export interface PaginationResponseDto<T> {
  pages        : number;
  current_page : number;
  limit        : number;
  total        : number;
  next         : string | null;
  prev         : string | null;
  items        : T[];
}

export type PaginationResponse<T> = ApiResponse<PaginationResponseDto<T>>;

// * Course *

export interface CourseResponseDto {
  id             : string;
  title          : string;
  description    : string;
  id_category    : string;
  category_name  : string;
  thumbnail_url ?: string | null;
  id_file       ?: string | null;
  id_owner       : string;
  price          : number;
  current_enrolled: number;
  capacity      ?: number;
  spots_remaining: number;
}

// `GET /courses/detailed/:id` — mismo curso con el profesor resuelto por el
// backend. El owner viaja anidado (no desnormalizado campo por campo) para que
// agregar un dato del profesor no sume otra columna plana acá.
export interface CoursePopulatedResponseDto {
  id             : string;
  title          : string;
  description    : string;
  id_category    : string;
  category_name  : string;
  thumbnail_url ?: string | null;
  id_file       ?: string | null;
  owner          : {
    id          : string;
    username    : string;
    email       : string;
    avatar_url ?: string | null;
    bio        ?: string | null;
  };
  price            : number;
  current_enrolled : number;
  capacity        ?: number;
  spots_remaining ?: number | null;
}

// * Teacher Request *

export type TeacherRequestStatus = 'pending' | 'approved' | 'rejected';
export type TeacherExperienceLevelResponse = 'none' | 'informal' | 'teacher';

export interface TeacherRequestResponseDto {
  id                : string;
  id_user           : string;
  status            : TeacherRequestStatus;
  category_ids      : string[];
  about_you         : string;
  experience_level  : TeacherExperienceLevelResponse;
  course_title      : string;
  course_summary    : string;
  portfolio_url    ?: string | null;
  rejection_reason ?: string | null;
  created_at        : string;
  reviewed_at      ?: string | null;
}

// * File *

export type ResourceValidTypes = 'image' | 'video' | 'raw' | 'auto';

export interface FileResponseDto {
  id            : string;
  public_id     : string;
  folder        : string;
  size          : number;
  url           : string;
  extension     : string;
  resource_type : ResourceValidTypes;
}

// * Category *

export interface CategoryResponseDto {
  id   : string;
  name : string;
  slug : string;
}

// * Enrollment *

export interface EnrollmentResponseDto {
  id                : string;
  id_user           : string;
  id_course         : string;
  purchaseDate      : string;
  progress          : number;
  completed_lessons : string[];
  last_accessed_at  : string;
}

export interface EnrollmentPopulatedResponseDto {
  id      : string;
  id_user : string;
  // `_id` y no `id`: es lo que manda el backend en este populate.
  course  : {
    _id           : string;
    title         : string;
    id_owner      : string;
    category_name : string;
    thumbnail_url : string;
  };
  purchaseDate      : string;
  progress          : number;
  completed_lessons : string[];
  last_accessed_at  : string;
}

// * Modules *

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
    content_type     ?: 'video' | 'document' | null;
    duration_minutes ?: number | null;
  }[];
}

// * Lessons *

export interface LessonResponseDto {
  // TODO: un `id` opcional en una respuesta es señal de que este tipo se usa
  // también como body de creación. Partirlo en respuesta + request obliga a
  // tocar `Lesson`/`LessonPopulated`, que también declaran `id` opcional.
  id           ?: string;
  id_course     : string;
  id_module     : string;
  id_file       : string;
  title         : string;
  description   : string;
  lesson_number : number;
  uploaded_at   : string;
}

export interface LessonPopulatedResponseDto {
  id          : string;
  id_course   : string;
  id_module   : string;
  title       : string;
  description : string;
  file        : {
    id            : string;
    url           : string;
    resource_type : 'image' | 'video';
    extension     : string;
  };
  lesson_number : number;
  uploaded_at   : string;
}

// * Payment *

export interface IssuerResponseDto {
  id               : string;
  name             : string;
  payment_type_id  : string;
  thumbnail        : string;
  secure_thumbnail : string;
}

export interface IdentificationTypeResponseDto {
  id   : string;
  name : string;
  type : string;
  // TODO: MercadoPago documenta estos dos como número. Verificar contra una
  // respuesta real antes de cambiar el tipo: el mapper los pasa tal cual.
  min_length : string;
  max_length : string;
}

// Respuesta de POST /orders/ : el backend devuelve el payment persistido en Mongo
// (PaymentResponseDto), no la orden de MercadoPago. `status` es el status del gateway
// tal cual ('processed' | 'action_required' | ...) y `id_payment` es el id de la orden en MP.
export interface OrderResponseDto {
  id         : string;
  id_user    : string;
  id_courses : string[];
  id_payment : string | null;
  amount     : number;
  date       : string;
  method     : string | null;
  status     : string;
}
