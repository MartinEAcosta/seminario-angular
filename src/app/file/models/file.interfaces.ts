import { ResourceValidTypes } from "../../shared/models/api.interfaces";

export type UploadFolder = 'course' | 'lesson' | 'user';

export interface UploadedFile {
    id            : string,
    public_id     : string,
    folder        : string,
    url          ?: string | null,
    size          : number,
    extension     : string,
    resource_type : ResourceValidTypes,
}