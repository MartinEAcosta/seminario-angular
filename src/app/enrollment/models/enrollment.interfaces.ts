
export interface Enrollment {
  id             : string;
  id_user        : string;
  id_course      : string;
  purchaseDate   : Date;
  progress       : number;
  completed_lessons : string[];
}

export interface EnrollmentDetailed {
  id             : string;
  id_user        : string;
  course         : {
    id_course : string;
    title : string;
    id_owner : string;
    thumbnail_url : string;
  }
  purchaseDate   : Date;
  progress       : number;
  completed_lessons : string[];
}