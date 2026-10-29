export interface Course {
    id              : string;
    title           : string;
    description     : string;
    id_category     : string;
    category_name   : string;
    thumbnail_url   : string | null;
    id_file         : string | null;
    id_owner        : string;
    price           : number;
    capacity?       : number | null;
    owner_name      : string | null;
    owner_avatar_url: string | null;
    owner_bio       : string | null;
    spots_remaining : number | null;
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

