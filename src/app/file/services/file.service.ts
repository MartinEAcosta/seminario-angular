import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, throwError } from 'rxjs';

import { FileMapper } from '@mappers/file.mapper';
import { DeleteResponse, FileResponse } from '../../shared/models/api.interfaces';
import { UploadedFile } from '@file/models/file.interfaces';
import { CourseFormState } from '@course/state/course-form/course-form-state';
import { LessonFormState } from '@lesson/state/lesson-form/lesson-form-state';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {  
  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}file`;
  
  private courseFormState = inject(CourseFormState);
  private lessonFormState = inject(LessonFormState);
  
  private previousThumbnailUrl: string | null = null;
  private previousMediaUrl: string | null = null;

  constructor ( ) { }

  public uploadFiles = ( folder : string , id_entity : string , files : FileList  ) : Observable<UploadedFile[]> => {
    if( !files ) return of([]);

    const uploadObservable = Array.from( files ).map( ( uniqueFile ) => 
      this.uploadFile( folder, id_entity , uniqueFile  )
    );
    // Se encarga de esperar hasta todas las peticiones emitan un valor, en caso de fallar
    // vuelve hacia atras
    return forkJoin(uploadObservable);
  }
  
  public uploadFile = ( folder : string , id_entity : string, file : File ) : Observable<UploadedFile> => {
    
    const formData = new FormData( );
    formData.append( 'files', file );
    return this.http
                .post<FileResponse>(
                                    `${this.baseURL}/upload/single/${folder}/${id_entity}`, 
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

  public deleteFile = ( id : string ) : Observable<DeleteResponse> => {
    return this.http
                .delete<DeleteResponse>(
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
  
  public deleteCourseThumbnail = ( id : string ) : Observable<DeleteResponse> => {
    return this.http
                .delete<DeleteResponse>(
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

  public getFileByPublicId = ( public_id : string ) => {
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

  public onFileChanged = ( event : Event, type : 'lessons' | 'courses' ) => {
    const fileChanged = ( event.target as HTMLInputElement ).files;
    if( !fileChanged ) return;
    // En caso de que el el fileList no sea undefined o vacio, permite generar url para utilizar de forma local
    const url = Array.from( fileChanged ?? [ ] )
                                                  .map( 
                                                        (file) => URL.createObjectURL(file)
                                                  );

    switch (type) {
      case 'courses':
        if (this.previousThumbnailUrl) URL.revokeObjectURL(this.previousThumbnailUrl);
        this.previousThumbnailUrl = url.shift()!;
        this.courseFormState.setTempThumbnail(this.previousThumbnailUrl);
        this.courseFormState.setFileThumbnail(fileChanged[0]);
        break;

      case 'lessons':
        if (this.previousMediaUrl) URL.revokeObjectURL(this.previousMediaUrl);
        this.previousMediaUrl = url.shift()!;
        this.lessonFormState.setTempMedia(this.previousMediaUrl);
        this.lessonFormState.setMediaFile(fileChanged[0]);
        const type = fileChanged.item(0)?.type.split('/').at(0) as 'image' | 'video' | undefined;
        this.lessonFormState.setTypeMedia(
          type === 'image' || type === 'video' ? type : null
        );
        break;
    }
  }
}
