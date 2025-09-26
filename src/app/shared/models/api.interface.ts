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
  id_category    : string;
  thumbnail_url ?: string | null;
  file_id       ?: string | null;
  id_owner    : string;
  price       : number;
  capacity?   : number;
}


export type CourseResponse = ApiResponse<CourseUniqueResponse>;
export type CourseListResponse = ApiResponse<CourseUniqueResponse[]>;

// * Auth *|

// * File * 

export type ResourceValidTypes = "image" | "video" | "raw" | "auto" ;


export interface FileUniqueResponse {
  id            : string;
  public_id     : string;
  folder        : string;
  size          : number;
  url           : string;
  extension     : string;
  resource_type : ResourceValidTypes;
}

export type FileRemovedResponse = ApiResponse<boolean>;
export type FileResponse = ApiResponse<FileUniqueResponse>; 

// * Category * 

export interface CategoryUniqueResponse {
  id   : string;
  name : string;
  slug : string;
}

export type CategoryListResponse = ApiResponse<CategoryUniqueResponse[]>;

// * Enrollment *

export interface EnrollmentUniqueResponse {
  id             : string;
  id_user        : string;
  id_course      : string;
  purchaseDate   : Date;
  progress       : number;
  completionDate : Date;
}

export interface EnrollmentDetailedUniqueResponse {
  id : string;
  id_user : string;
  course : {
    _id : string;
    title : string;
    id_owner : string;
    thumbnail_url : string;
  }
  purchaseDate : Date;
  progress : number;
  completionDate : Date;
}

export type EnrollmentListResponse = ApiResponse<EnrollmentUniqueResponse[]>;
export type EnrollmentDetailedListResponse = ApiResponse<EnrollmentDetailedUniqueResponse[]>;

//* Lessons * //

export interface LessonUniqueResponse {
  id : string;
  id_course : string;
  title : string;
  description : string;
  id_file : string;
  unit : number;
  chapter : number;
  lesson_number : number;
  uploaded_at : Date;
}

export type LessonResponse = ApiResponse<LessonUniqueResponse>;
export type LessonListResponse = ApiResponse<LessonUniqueResponse[]>