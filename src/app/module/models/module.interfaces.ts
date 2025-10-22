
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
    title : string;
    id : string;
  }[];
}