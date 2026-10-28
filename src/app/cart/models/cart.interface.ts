import { Course } from "@course/models/course.interfaces";

export interface CartItem{
    course: Course,
    quantity: number,
}

export interface ItemQuantity {
    id_course  : string;
    title      : string;
    unit_price : string;
    quantity   : number;
}