// Forma de presentar interfaces vista en una preview del curso de Fernando Herrera

export interface Course {
    _id:         string;
    title:       string;
    description: string;
    imgURL:      string[];
    owner:       string;
    price:       number;
    offer:       boolean;
    capacity?:   number;
}

export interface CourseResponse {
    _id:         string;
    title:       string;
    description: string;
    imgURL:      string[];
    owner:       string;
    price:       number;
    offer:       boolean;
    capacity?:   number;
}

export interface CourseApiResponse {
  ok: boolean;
  total: number;
  page: number;
  limit: number;
  data: CourseResponse[];
}