// Formas crudas que llegan del backend para enrollment. Nada de este archivo se
// usa en un componente: todo pasa antes por `EnrollmentMapper`.
//
// Las fechas se tipan `string`: `JSON.parse` no construye `Date`.

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
