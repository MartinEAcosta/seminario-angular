import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { FileMapper } from '@mappers/file.mapper';
import { FileRemovedResponse, FileResponse } from '../../models/api.interface';
import { UploadedFile } from '../../models/file.interface';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}file`;

  public thumbnailFile = signal<File | null>(null);
  public mediaFiles = signal<FileList | null>(null);

  constructor ( ) { }

  updateFiles = ( folder : string , files : FileList  ) : Observable<UploadedFile[]> => {
    if( !files ) return of([]);

    const uploadObservable = Array.from( files ).map( ( uniqueFile ) => 
      this.updateFile( folder, uniqueFile  )
    );
    // Se encarga de esperar hasta todas las peticiones emitan un valor, en caso de fallar
    // vuelve hacia atras
    return forkJoin(uploadObservable);
  }
  
  updateFile = ( folder : string, file : File ) : Observable<UploadedFile> => {
    const formData = new FormData( );
    formData.append( 'files', file );
    return this.http
                .post<FileResponse>(
                                    `${this.baseURL}/upload/single/${folder}`, 
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
                                      `${this.baseURL}/${id}`,
                                    )
                                    .pipe(
                                      map( fileResponse => {
                                        return fileResponse;
                                      }),
                                      catchError( ({error}) => {
                                        return throwError(() => new Error(`${error}`));
                                      }),
                                    );
  }
  
  deleteCourseThumbnail = ( id : string ) : Observable<FileRemovedResponse> => {
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

  getFileByPublicId = ( public_id : string ) => {
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
