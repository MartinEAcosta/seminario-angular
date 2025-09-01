import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { FileMapper } from '@mappers/file.mapper';
import { FileRemovedResponse, FileResponse } from '../../interfaces/api.interface';
import { UploadedFile } from '../../interfaces/file.interface';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}file`;

  uploadImages = ( folder : string , images: FileList , id : string ) : Observable<UploadedFile[]> => {
    if( !images ) return of([]);

    const uploadObservable = Array.from( images ).map( (imageFile) => 
      this.uploadImage( folder, imageFile , id )
    );
    // Se encarga de esperar hasta todas las peticiones emitan un valor, en caso de fallar
    // vuelve hacia atras
    return forkJoin(uploadObservable);
  }
  
  uploadImage = ( folder : string, image : File , id : string ) : Observable<UploadedFile> => {
    const formData = new FormData( );
    formData.append( 'files', image );
    return this.http
                .post<FileResponse>(
                                    `${this.baseURL}/upload/single/${folder}/${id}`, 
                                    formData,
                                  )
                                  .pipe(
                                    map( fileResponse => {
                                      return FileMapper.mapResponseToFile( fileResponse.data );
                                    }),
                                    catchError( ({ error }) => {
                                      return throwError(() => new Error(`${error}`));
                                    }),
                                  );
  }

  deleteFile = ( id : string ) : Observable<FileRemovedResponse> => {
    return this.http
                .delete<FileRemovedResponse>(
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

  getImageByPublicId = ( public_id : string ) => {
    return this.http
                .get<FileResponse>(
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

}
