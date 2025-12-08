import { ModulePopulated } from "src/app/module/models/module.interfaces";

export interface ApiResponse<T> {
  ok        : boolean;
  data      : T; 
}

export interface PaginationResponseDto<T> {
  pages : number,
  current_page  : number,
  limit : number,
  total : number,
  next  : string | null,
  prev  : string | null,
  items : T,
}

export type PaginationResponse<T> = ApiResponse<PaginationResponseDto<T>>;

export type DeleteResponse = ApiResponse<boolean>;

// * Course *

export interface CourseUniqueResponse {
  id          : string;
  title       : string;
  description : string;
  id_category    : string;
  thumbnail_url ?: string | null;
  id_file       ?: string | null;
  id_owner    : string;
  price       : number;
  capacity?   : number;
}

export type CourseResponse = ApiResponse<CourseUniqueResponse>;
export type CourseListResponse = ApiResponse<CourseUniqueResponse[]>;

// * Auth *

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
  completed_lessons : string[];
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
  completed_lessons : string[];
}

export interface NextEnrollmentUniqueResponse {
  id             : string;
  id_user        : string;
  id_course      : string;
  purchaseDate   : Date;
  progress       : number;
  completed_lessons : string[];
  next_lesson    : string;
}

export type EnrollmentResponse = ApiResponse<EnrollmentUniqueResponse>;
export type NextEnrollmentResponse = ApiResponse<NextEnrollmentUniqueResponse>;
export type EnrollmentListResponse = ApiResponse<EnrollmentUniqueResponse[]>;
export type EnrollmentDetailedListResponse = ApiResponse<EnrollmentDetailedUniqueResponse[]>;

//* Modules * //

export interface ModuleUniqueResponse {
  id : string;
  id_course : string;
  title : string;
  unit : number;
  lessons : string[],
}

export type ModuleResponse = ApiResponse<ModuleUniqueResponse>;
export type ModuleListResponse = ApiResponse<ModuleUniqueResponse[]>
export type ModulePopulatedListResponse = ApiResponse<ModulePopulated[]>;
//* Lessons * //

export interface LessonUniqueResponse {
  id ?: string;
  id_course : string;
  id_module : string;
  id_file : string;
  title : string;
  description : string;
  lesson_number : number;
  uploaded_at : Date;
}

export interface LessonPopulatedUniqueResponse {
  id : string;
  id_course : string;
  id_module : string;
  title : string;
  description : string;
  file : {
    id      : string;
    url     : string;
    resource_type : 'image' | 'video';
    extension : string;
  };
  lesson_number : number;
  uploaded_at : Date;
}

export type LessonResponse = ApiResponse<LessonUniqueResponse>;
export type LessonPopulatedResponse = ApiResponse<LessonPopulatedUniqueResponse>
export type LessonListResponse = ApiResponse<LessonUniqueResponse[]>
export type LessonPopulatedListResponse = ApiResponse<LessonPopulatedUniqueResponse[]>

//* Payment *//

export interface IssuerUniqueResponse {
  id : string,
  name : string,
  payment_type_id: string,
  thumbnail : string,
  secure_thumbnail : string,
} 

export type IssuerResponse = ApiResponse<IssuerUniqueResponse>;
export type IssuerListResponse = ApiResponse<IssuerUniqueResponse[]>;

export interface IndentificationTypeUniqueResponse {
  id : string,
  name : string,
  type : string,
  min_length : string,
  max_length : string,
}

export type IdentificationTypeListResponse = ApiResponse<IndentificationTypeUniqueResponse[]>;


export type TotalResponse = ApiResponse<number>;