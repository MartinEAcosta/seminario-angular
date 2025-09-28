
export interface Lesson {
    id_course     : string;
    title         : string;
    description   : string;
    id_file       : string;
    unit          : number;
    chapter       : number;
    lesson_number : number;
    uploaded_at   : Date;
}

export interface LessonDto{
    id_course     : string;
    title         : string;
    desciption    : string;
    id_file      ?: string;
    unit         ?: number;
    chapter      ?: number;
    lesson_number ?: number;
    uploaded_at   ?: Date;
}