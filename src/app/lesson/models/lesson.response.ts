// Formas crudas que llegan del backend para lesson. Nada de este archivo se usa
// en un componente: todo pasa antes por `LessonMapper`.
//
// Las fechas se tipan `string`: `JSON.parse` no construye `Date`.

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
