import { ResourceValidTypes } from "./api.interface";

export interface UploadedFile {
    id            : string,
    public_id     : string,
    folder        : string,
    url          ?: string | null,
    size          : number,
    extension     : string,
    resource_type : ResourceValidTypes,
}