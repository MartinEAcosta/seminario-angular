export interface Course {
    id          : string;
    title       : string;
    description : string;
    imgUrl      : string[];
    owner       : string;
    price       : number;
    capacity?   : number;
}

export interface CourseDTO {
    _id?        : string;
    title       : string;
    description : string;
    category    : string;
    imgUrl      : string[];
    owner?      : string;
    price?      : number;
    capacity?   : number;
}

