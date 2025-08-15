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
    thumbnail_url      : string[];
    owner       : string;
    price       : number;
    capacity?   : number;
}


export type CourseResponse = ApiResponse<CourseUniqueResponse>;
export type CourseListResponse = ApiResponse<CourseUniqueResponse[]>;

// * Auth *|

// * File * 

export interface FileUniqueResponse {
    id            : string,
    filename      : string,
    public_id     : string,
    size          : number,
    extension     : string,
    resource_type : "image" | "video" | "raw" | "auto",
}

export type FileResponse = ApiResponse<FileUniqueResponse>; 