// Formas crudas que llegan del backend para course. Nada de este archivo se usa
// en un componente: todo pasa antes por `CourseMapper`.
// Las fechas se tipan `string`: `JSON.parse` no construye `Date`.

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
