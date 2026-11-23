import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

import { FileMapper } from '@mappers/file.mapper';
import { ApiResponse } from '@shared/models/api.response';
import { FileResponseDto } from '@file/models/file.response';
import { ResourceValidTypes, SelectedFile, UploadedFile, UploadFolder } from '@file/models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}file`;

  constructor ( ) { }

  uploadFiles = ( folder : UploadFolder , id_entity : string , files : FileList  ) : Observable<UploadedFile[]> => {
    if( !files ) return of([]);

    const uploadObservable = Array.from( files ).map( ( uniqueFile ) => 
      this.uploadFile( folder, id_entity , uniqueFile  )
    );
    // Se encarga de esperar hasta todas las peticiones emitan un valor, en caso de fallar
    // vuelve hacia atras
    return forkJoin(uploadObservable);
  }
  
  uploadFile = ( folder : UploadFolder , id_entity : string, file : File ) : Observable<UploadedFile> => {
    const formData = new FormData( );
    formData.append( 'files', file );
    return this.http
                .post<ApiResponse<FileResponseDto>>(
                                    `${this.baseURL}/upload/single/${folder}/${id_entity}`, 
                                    formData,
                                  )
                                  .pipe(
                                    map( fileResponse => {
                                      console.log(fileResponse)
                                      return FileMapper.mapResponseToFile( fileResponse.data );
                                    }),
                                    catchError( ( error ) => throwError( () => error ) ),
                                  );
  }

  deleteFile = ( id : string ) : Observable<ApiResponse<boolean>> => {
    console.log(id)
    return this.http
                .delete<ApiResponse<boolean>>(
                                      `${this.baseURL}/${id}`,
                                    )
                                    .pipe(
                                      map( fileResponse => {
                                        console.log(fileResponse);
                                        return fileResponse;
                                      }),
                                      catchError( ( error ) => throwError( () => error ) ),
                                    );
  }
  
  deleteCourseThumbnail = ( id : string ) : Observable<ApiResponse<boolean>> => {
    return this.http
                .delete<ApiResponse<boolean>>(
                                      `${this.baseURL}/course-thumbnail/${id}`,
                                    )
                                    .pipe(
                                      map( fileResponse => {
                                        console.log(fileResponse);
                                        return fileResponse;
                                      }),
                                      catchError( ( error ) => throwError( () => error ) ),
                                    );
  }

  getFileByPublicId = ( public_id : string ) => {
    return this.http
                .get<ApiResponse<FileResponseDto>>(
                                    `${this.baseURL}/get/${public_id}`
                                  )
                                  .pipe(
                                    map( res => {
                                      console.log(res);
                                      return res;
                                    }),
                                    catchError( ( error ) => throwError( () => error ) ),
                                  )
  }

  public onFileChanged = ( event : Event ) : SelectedFile | null => {
    const fileChanged = ( event.target as HTMLInputElement ).files?.[0];
    if( !fileChanged ) return null;

    // Ya no valida el tipo: la regla vive en `isAllowedMediaType`
    // (@file/utils/allowed-media-type) y el componente decide si muestra el
    // rechazo y por qué canal (ver SPEC 16). Por eso `mediaType` se castea —
    // acá todavía puede ser cualquier cosa que el usuario haya elegido, y el
    // object URL ya está creado antes de que nadie valide: el llamador que
    // rechaza el archivo tiene que liberarlo con `URL.revokeObjectURL`.
    return {
      file : fileChanged,
      previewURL : URL.createObjectURL(fileChanged),
      mediaType : fileChanged.type.split('/')[0] as ResourceValidTypes,
    };
  }

}
