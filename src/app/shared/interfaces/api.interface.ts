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
    thumbnail_url : string | null;
    thumbnail_id : string | null;
    id_owner       : string;
    price       : number;
    capacity?   : number;
}


export type CourseResponse = ApiResponse<CourseUniqueResponse>;
export type CourseListResponse = ApiResponse<CourseUniqueResponse[]>;

// * Auth *|

// * File * 

export type ResourceValidTypes = "image" | "video" | "raw" | "auto" ;


export interface FileUniqueResponse {
    id            : string,
    size          : number,
    extension     : string,
    resource_type : ResourceValidTypes,
    public_id     : string,
}

export type FileResponse = ApiResponse<FileUniqueResponse>; 