export interface Course {
    id              : string;
    title           : string;
    description     : string;
    id_category     : string;
    thumbnail_url   : string | null;
    file_id         : string | null;
    id_owner        : string;
    price           : number;
    capacity?       : number;
}

export interface CourseDTO {
    id?           : string;
    title         : string;
    description   : string;
    id_category   : string;
    thumbnail_url : string | null;
    file_id       : string | null;
    id_owner     ?: string;
    price?        : number;
    capacity?     : number;
}

