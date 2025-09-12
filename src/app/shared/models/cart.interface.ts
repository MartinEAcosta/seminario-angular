import { Course } from "src/app/course/models/course.interfaces";

export interface CartItem{
    course: Course,
    quantity: number,
}