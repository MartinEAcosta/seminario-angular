import { FormGroup } from "@angular/forms";
import { LessonListResponse, LessonPopulatedListResponse, LessonPopulatedUniqueResponse, LessonUniqueResponse } from "../shared/models/api.interface";
import { Lesson, LessonPopulated, SaveLessonDto } from "../lesson/models/lesson.interfaces";

export class LessonMapper {

    // * chequear el unit y chapter la forma en que se manejan
    static mapToCreateLessonDto = ( form : FormGroup ) : SaveLessonDto => {
        return {
            title : form.get('title')?.value,
            id_module : form.get('id_module')?.value,
            description : form.get('description')?.value,
            lesson_number : form.get('lesson_number')?.value,
        };
    };

    static mapResponseToLesson = ( response : LessonUniqueResponse ) : Lesson => {
        return {
            id        : response.id,
            id_course : response.id_course,
            id_module : response.id_module,
            title : response.title,
            description : response.description,
            id_file : response.id_file,
            lesson_number :  response.lesson_number,
            uploaded_at : new Date(response.uploaded_at),
        };
    }

    static mapResponseToLessonArray( response : LessonListResponse ) : Lesson[] {
        return response.data.map( this.mapResponseToLesson );
    }

    static mapResponseToLessonPopulated = ( response : LessonPopulatedUniqueResponse ) : LessonPopulated => {
        return {
            id : response.id,
            id_course : response.id_course,
            id_module : response.id_module,
            title : response.title,
            description : response.description,
            file : {
                id_file : response.file.id_file,
                url     : response.file.url,
            },
            lesson_number :  response.lesson_number,
            uploaded_at : new Date(response.uploaded_at),
        }
    }

    static mapResponseToLessonPopulatedArray( response : LessonPopulatedListResponse ) : LessonPopulated[] {
        return response.data.map( this.mapResponseToLessonPopulated );
    }
}