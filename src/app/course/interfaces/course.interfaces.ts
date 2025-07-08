// Forma de presentar interfaces vista en una preview del curso de Fernando Herrera

export interface Course {
    id:         string;
    title:       string;
    description: string;
    imgURL:      string[];
    owner:       string;
    price:       number;
    offer:       boolean;
    capacity?:   number;
}

export interface CourseDTO {
    _id?:         string;
    title:       string;
    description: string;
    imgURL:      string[];
    owner?:       string;
    price?:       number;
    offer?:       boolean;
    capacity?:   number;
}

export interface CourseApiResponse {
    _id:         string;
    title:       string;
    description: string;
    imgURL:      string[];
    owner:       string;
    price:       number;
    offer:       boolean;
    capacity?:   number;
}

export interface ApiResponse<T> {
  ok: boolean;
  total?: number; // Opcional para respuestas de un solo elemento
  page?: number;  // Opcional para respuestas de un solo elemento
  limit?: number; // Opcional para respuestas de un solo elemento
  data: T; // Puede ser un CourseApiData o un CourseApiData[]
}

export type CourseSingleApiResponse = ApiResponse<CourseApiResponse>;
export type CourseListApiResponse = ApiResponse<CourseApiResponse[]>;
