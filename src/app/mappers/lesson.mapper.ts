import { FormGroup } from "@angular/forms";
import { CreateLessonDto, Lesson, LessonDto, LessonPopulated } from "../lesson/models/lesson.interfaces";
import { LessonListResponse, LessonPopulatedListResponse, LessonPopulatedUniqueResponse, LessonUniqueResponse } from "../shared/models/api.interface";

export class LessonMapper {

    static mapToCreateLessonDto = ( form : FormGroup ) : CreateLessonDto => {
        return {
            title : form.get('title')?.value,
            description : form.get('description')?.value,
            unit : form.get('unit')?.value,
            chapter : form.get('chapter')?.value,
        };
    };

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

    static mapResponseToLessonPopulated = ( response : LessonPopulatedUniqueResponse ) : LessonPopulated => {
        return {
            id_course : response.id_course,
            title : response.title,
            description : response.description,
            file : {
                id_file : response.file.id_file,
                url     : response.file.url,
            },
            unit : response.unit,
            chapter : response.chapter,
            lesson_number :  response.lesson_number,
            uploaded_at : new Date(response.uploaded_at),
        }
    }

    static mapResponseToLessonPopulatedArray( response : LessonPopulatedListResponse ) : LessonPopulated[] {
        return response.data.map( this.mapResponseToLessonPopulated );
    }
}