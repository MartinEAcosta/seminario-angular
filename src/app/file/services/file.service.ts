import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { FileMapper } from '@mappers/file.mapper';
import { DeleteResponse, FileResponse } from '../../shared/models/api.interfaces';
import { UploadedFile } from '../models/file.interfaces';
import { CourseFormState } from 'src/app/course/state/course/course-form-state';
import { LessonFormState } from 'src/app/lesson/state/lesson/lesson-form-state';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}file`;
  
  private courseFormState = inject(CourseFormState);
  private lessonFormState = inject(LessonFormState);

  constructor ( ) { }

  uploadFiles = ( folder : string , id_entity : string , files : FileList  ) : Observable<UploadedFile[]> => {
    if( !files ) return of([]);

    const uploadObservable = Array.from( files ).map( ( uniqueFile ) => 
      this.uploadFile( folder, id_entity , uniqueFile  )
    );
    // Se encarga de esperar hasta todas las peticiones emitan un valor, en caso de fallar
    // vuelve hacia atras
    return forkJoin(uploadObservable);
  }
  
  uploadFile = ( folder : string , id_entity : string, file : File ) : Observable<UploadedFile> => {
    
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

  deleteFile = ( id : string ) : Observable<DeleteResponse> => {
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
  
  deleteCourseThumbnail = ( id : string ) : Observable<DeleteResponse> => {
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
        this.courseFormState.setTempThumbnail(url.shift()!);
        this.courseFormState.setFileThumbnail(fileChanged[0]);
        break;

      case 'lessons':
        this.lessonFormState.setTempMedia(url.shift()!);
        this.lessonFormState.setMediaFile(fileChanged[0]);
        const type = fileChanged.item(0)?.type.split('/').at(0) as 'image' | 'video' | undefined;
        this.lessonFormState.setTypeMedia(
          type === 'image' || type === 'video' ? type : null
        );
        break;
    }
  }
}
