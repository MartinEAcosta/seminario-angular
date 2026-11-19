import { Course } from "@course/models/course.interface";

export interface CartItem{
    course: Course,
    quantity: number,
}
