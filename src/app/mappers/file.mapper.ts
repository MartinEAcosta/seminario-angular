import { FileResponse, FileUniqueResponse } from "../shared/models/api.interface";
import { UploadedFile } from "../shared/models/file.interface";


export class FileMapper {

    constructor ( ) { }

    static mapResponseToFile = ( response : FileUniqueResponse ) : UploadedFile => {
        return {
            id            : response.id,
            public_id     : response.public_id,
            folder        : response.folder,
            url           : response.url,
            size          : response.size,
            extension     : response.extension,
            resource_type : response.resource_type,
        }
    };

}