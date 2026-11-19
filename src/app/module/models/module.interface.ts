import { LessonContentType } from '@lesson/models/lesson.interface';

export interface Module {
  id : string;
  id_course : string;
  title : string;
  unit : number;
  lessons : string[],
}

export interface ModulePopulated {
  id : string;
  id_course : string;
  title : string;
  unit : number;
  lessons : {
    id               : string;
    title            : string;
    content_type     : LessonContentType | null;
    duration_minutes : number | null;
  }[];
}