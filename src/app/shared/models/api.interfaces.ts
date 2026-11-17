// El sobre genérico de todo lo que llega del backend: lo pone `ApiResponse<T>`,
// que los servicios escriben completo en cada `http.get<...>()` para que el
// contrato se lea en el lugar donde se hace la request.
//
// Los DTOs concretos ya no viven acá: cada feature declara los suyos en su
// propio `models/<feature>.response.ts` (`@course/models/course.response`,
// `@lesson/models/lesson.response`, etc.).
//
// Nada de esos archivos se usa en un componente: todo pasa antes por su mapper
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
