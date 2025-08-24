export interface Course {
    id              : string;
    title           : string;
    description     : string;
    thumbnail_url   : string;
    id_owner        : string;
    price           : number;
    capacity?       : number;
}

export interface CourseDTO {
    _id?          : string;
    title         : string;
    description   : string;
    category      : string;
    thumbnail_url : string;
    id_owner      : string;
    price?        : number;
    capacity?     : number;
}

