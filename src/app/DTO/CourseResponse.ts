import { Course } from "../components/course-list/Course";

export interface CourseResponse{
    ok: boolean;
    courses: Course[];
}
