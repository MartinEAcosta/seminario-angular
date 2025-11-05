export interface Course {
    id              : string;
    title           : string;
    description     : string;
    id_category     : string;
    thumbnail_url   : string | null;
    id_file         : string | null;
    id_owner        : string;
    price           : number;
    capacity?       : number | null;
}

export interface CourseDTO {
    id?           : string;
    title         : string;
    description   : string;
    id_category   : string;
    thumbnail_url ?: string;
    id_file       ?: string;
    id_owner     ?: string;
    price?        : number;
    capacity?     : number | null;
}

