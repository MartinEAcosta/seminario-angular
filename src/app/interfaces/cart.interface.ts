import { Course } from "./course.interfaces";

export interface Cart{
    courses : Map<Course,number>
}