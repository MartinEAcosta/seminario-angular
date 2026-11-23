export type ResourceValidTypes = 'image' | 'video' | 'raw' | 'auto';

export type UploadFolder = 'course' | 'lesson' | 'user';

export interface SelectedFile {
    file : File,
    previewURL : string,
    mediaType : ResourceValidTypes;
}

export interface UploadedFile {
    id            : string,
    public_id     : string,
    folder        : string,
    url          ?: string | null,
    size          : number,
    extension     : string,
    resource_type : ResourceValidTypes,
}