import { ResourceValidTypes } from '@file/models/file.interface';

// Tipo de contenido de una lección tal como lo lista un módulo. Vive en `lesson`
// aunque hoy el campo sólo aparezca anidado en los dos tipos de `module`: tipa una
// propiedad de una lección, y `module` ya depende de `lesson` de hecho al embutir
// su forma.
export type LessonContentType = 'video' | 'document';

export interface Lesson {
    id           ?: string;
    id_course     : string;
    id_module     : string;
    id_file       : string;
    title         : string;
    description   : string;
    lesson_number : number;
    uploaded_at   : Date;
}

export interface LessonPopulated {
    id           ?: string;
    id_course     : string;
    id_module     : string;
    title         : string;
    description   : string;
    file          : {
        id_file : string | null;
        url     : string | null;
        resource_type : ResourceValidTypes | null;
        extension : string | null;
    };
    lesson_number : number;
    uploaded_at   : Date;
}
