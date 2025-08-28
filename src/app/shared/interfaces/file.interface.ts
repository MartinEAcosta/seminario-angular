import { ResourceValidTypes } from "./api.interface";

export interface UploadedFile {
    id            : string,
    size          : number,
    extension     : string,
    resource_type : ResourceValidTypes,
    public_id     : string,
}