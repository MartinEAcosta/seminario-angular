import { ResourceValidTypes } from "./api.interface";

export interface UploadedFile {
    id            : string,
    size          : number,
    url          ?: string | null,
    extension     : string,
    resource_type : ResourceValidTypes,
    public_id     : string,
}