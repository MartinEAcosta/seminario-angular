import { Course } from "src/app/course/models/course.interfaces";

export interface CartItem{
    course: Course,
    quantity: number,
}

export interface ItemQuantity {
    id_course : string,
    quantity : number,
}