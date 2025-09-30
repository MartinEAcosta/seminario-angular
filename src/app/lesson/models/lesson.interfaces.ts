
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

export interface LessonPopulated {
    id_course     : string;
    title         : string;
    description   : string;
    file          : {
        id_file : string | null;
        url     : string | null;
    };
    unit          : number;
    chapter       : number;
    lesson_number : number;
    uploaded_at   : Date;
}

export interface CreateLessonDto{
    title         : string;
    description    : string;
    unit         ?: number;
    chapter      ?: number;
    lesson_number ?: number;
}

export interface LessonDto{
    id_course     : string;
    title         : string;
    description    : string;
    id_file      ?: string;
    unit         ?: number;
    chapter      ?: number;
    lesson_number ?: number;
    uploaded_at   ?: Date;
}