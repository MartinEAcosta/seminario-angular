
export interface UploadedFile {
    id               : string; // Podría venir de la DB
    id_course        : string;
    title            : string;
    unit             : number;
    chapter          : number;
    public_id        : string;
    url              : string;
    size             : number;
    extension        : string;
    resource_type : "image" | "video" | "raw" | "auto",

}