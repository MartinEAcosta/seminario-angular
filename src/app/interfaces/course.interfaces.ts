// Forma de presentar interfaces vista en una preview del curso de Fernando Herrera


export interface CourseResponse {
    ok:      boolean;
    courses: Course[];
}

export interface Course {
    _id:         string;
    title:       string;
    description: string;
    imgURL:      string;
    owner:       string;
    price:       number;
    offer:       boolean;
    capacity?:   number;
}