import { Lesson } from "../lesson/models/lesson.interfaces";
import { LessonListResponse, LessonUniqueResponse } from "../shared/models/api.interface";

export class LessonMapper {

    static mapResponseToLesson = ( response : LessonUniqueResponse ) : Lesson => {
        return {
            id_course : response.id_course,
            title : response.title,
            description : response.description,
            id_file : response.id_file,
            unit : response.unit,
            chapter : response.chapter,
            lesson_number :  response.lesson_number,
            uploaded_at : new Date(response.uploaded_at),
        };
    }

    static mapResponseToLessonArray( response : LessonListResponse ) : Lesson[] {
        return response.data.map( this.mapResponseToLesson );
    }
}