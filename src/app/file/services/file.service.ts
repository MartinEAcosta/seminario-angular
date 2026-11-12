import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

import { UIService } from '@shared/services/ui/ui.service';
import { FileMapper } from '@mappers/file.mapper';
import { ApiResponse, FileResponseDto } from '@shared/models/api.interfaces';
import { SelectedFile, UploadedFile, UploadFolder } from '@file/models/file.interfaces';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}file`;
  private uiService = inject(UIService);
  
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
                                    catchError( ({ error }) => {
                                      return throwError(() => new Error(`${error}`));
                                    }),
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
                                      catchError( ({error}) => {
                                        console.log(error)
                                        this.uiService.showToastMessage('Error al eliminar el archivo. Por favor, inténtalo de nuevo.');
                                        return throwError(() => new Error(`${error}`));
                                      }),
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
                                      catchError( ({error}) => {
                                        return throwError(() => new Error(`${error}`));
                                      }),
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
                                    catchError( error => error),
                                  )
  }

  public onFileChanged = ( event : Event ) : SelectedFile | null => {
    const fileChanged = ( event.target as HTMLInputElement ).files?.[0];
    if( !fileChanged ) return null;

    const kind = fileChanged.type.split('/')[0];
    if( kind !== 'image' && kind !== 'video' ) {
      this.uiService.showToastMessage('Tipo de archivo no válido. Por favor, selecciona una imagen o un video.');
      return null;
    };

    return { 
      file : fileChanged, 
      previewURL : URL.createObjectURL(fileChanged), 
      mediaType : kind 
    };
  }

}
