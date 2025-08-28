export interface ApiResponse<T> {
  ok        : boolean;
  total?    : number; // Opcional para respuestas de un solo elemento
  page?     : number;  // Opcional para respuestas de un solo elemento
  limit?    : number; // Opcional para respuestas de un solo elemento
  data      : T; 
}

// * Course *

export interface CourseUniqueResponse {
    id          : string;
    title       : string;
    description : string;
    category    : string;
    thumbnail_url : string;
    id_owner    : string;
    price       : number;
    capacity?   : number;
}


export type CourseResponse = ApiResponse<CourseUniqueResponse>;
export type CourseListResponse = ApiResponse<CourseUniqueResponse[]>;

// * Auth *|

// * File * 

export interface FileUniqueResponse {
    id               : string; // Podría venir de la DB
    id_course        : string;
    title            : string;
    unit             : number;
    chapter          : number;
    public_id        : string;
    url              : string;
    size             : number;
    extension        : string;
    resource_type : "image" | "video" | "raw" | "auto",
}

export type FileResponse = ApiResponse<FileUniqueResponse>; 