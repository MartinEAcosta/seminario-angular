import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { LessonMapper } from '@mappers/lesson.mapper';
import { DeleteResponse, LessonPopulatedListResponse, LessonPopulatedResponse, LessonResponse, LessonUniqueResponse } from 'src/app/shared/models/api.interface';
import { Lesson, LessonPopulated, SaveLessonDto } from '../models/lesson.interfaces';
import { FileService } from 'src/app/shared/services/file/file.service';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  folder = 'lessons';

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}lessons`;
  private fileService = inject(FileService);
  
  constructor() { }

  public getAllLessonPopulatedFromCourse = ( courseId : string ) : Observable<LessonPopulated[]> => {
    return this.http
                    .get<LessonPopulatedListResponse>(`${this.baseURL}/detailed/course/${courseId}`)
                    .pipe(
                      map( (lessonResponse) => {
                        // console.log(lessonResponse)
                        return LessonMapper.mapResponseToLessonPopulatedArray( lessonResponse );
                      }),
                      catchError( ({ error }) => {
                        console.log(error)
                        return throwError(() => new Error(`${error.errorMessage}`));
                      }),
                    );
  }

  public getLessonById = ( lessonId : string ) : Observable<Lesson> => {
    return this.http.get<any>(`${this.baseURL}/${lessonId}`)
                    .pipe(
                      map( (lessonResponse) => {
                        return LessonMapper.mapResponseToLesson( lessonResponse );
                      }),
                      catchError( ({ error }) => {
                        console.log(error)
                        return throwError(() => new Error(`${error.errorMessage}`));
                      })
                    );
  }

    public getNextLesson = ( id_enrollment : string ) : Observable<LessonPopulated> => {
    return this.http
                    .get<LessonPopulatedResponse>( `${this.baseURL}/next/${id_enrollment}` )
                    .pipe(
                      map( ( enrollmentResponse ) => {
                          console.log(enrollmentResponse);
                          return LessonMapper.mapResponseToLessonPopulated( enrollmentResponse.data );
                      }),
                      catchError( (error) => {
                        console.log(error);
                        return throwError(() => new Error(`${error.errorMessage}`));
                      }),
                    );
  }

  public saveLesson = ( lessonRequest : SaveLessonDto , file : File | null = null ) : Observable<Lesson> => {
    const { id , ...rest } = lessonRequest;

    if( id ){
      return this.http
            .put<LessonResponse>(`${this.baseURL}/update/${id}` , lessonRequest )
            .pipe(
              map( (lessonResponse) =>{
                const lesson = LessonMapper.mapResponseToLesson( lessonResponse.data );
                if( file ){
                  this.fileService.uploadFile( this.folder , id , file ).subscribe();
                }
                return lesson;
              }),
              catchError( ({ error }) => {
                console.log(error)
                return throwError(() => new Error(`${error.errorMessage}`));
              }),
            );
    }
    else{
      return this.http
                  .post<LessonResponse>(`${this.baseURL}/new` , rest )
                  .pipe(
                    map( (lessonResponse) =>{
                      const lesson = LessonMapper.mapResponseToLesson( lessonResponse.data );
                      if( file ){
                        this.fileService.uploadFile( this.folder , lesson.id! , file ).subscribe();
                      }
                      return lesson;
                    }),
                    catchError( ({ error }) => {
                      console.log(error)
                      return throwError(() => new Error(`${error.errorMessage}`));
                    }),
                  );
    }
  }

  public deleteLesson = ( id : string ) : Observable<boolean> => {
    return this.http
            .delete<DeleteResponse>(`${this.baseURL}/delete/${id}` )
            .pipe(
              map( (response) =>{
                return response.data;
              }),
              catchError( ({ error }) => {
                console.log(error)
                return throwError(() => new Error(`${error.errorMessage}`));
              }),
            );
  }

}
