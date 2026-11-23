
export interface Module {
  id : string;
  id_course : string;
  title : string;
  unit : number;
  lessons : string[],
}

export interface ModuleDTO {
  id ?: string,
  id_course : string,
  title ?: string,
  unit ?: number,
}

export interface ModulePopulated {
  id : string;
  id_course : string;
  title : string;
  unit : number;
  lessons : {
    id               : string;
    title            : string;
    content_type     : 'video' | 'document' | null;
    duration_minutes : number | null;
  }[];
}