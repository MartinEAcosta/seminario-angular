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
    current_enrolled: number;
    capacity?       : number | null;
    spots_remaining?: number | null;
};

export interface CoursePopulated {
    id              : string;
    title           : string;
    description     : string;
    id_category     : string;
    category_name   : string;
    thumbnail_url   : string | null;
    id_file         : string | null;
    owner           : {
        id : string;
        username : string;
        email : string;
        avatar_url : string | null;
    };
    price           : number;
    current_enrolled: number;
    capacity?       : number | null;
    spots_remaining?: number | null;
};

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

