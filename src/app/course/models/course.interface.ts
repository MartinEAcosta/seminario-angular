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

export interface CoursePopulated extends Course {
    owner           : {
        id : string;
        username : string;
        email : string;
        avatar_url : string | null;
        bio ?: string | null;
    };
};

