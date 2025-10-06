import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { LessonMapper } from '@mappers/lesson.mapper';
import { DeleteResponse, LessonPopulatedListResponse, LessonPopulatedResponse, LessonUniqueResponse } from 'src/app/shared/models/api.interface';
import { Lesson, LessonDto, LessonPopulated, SaveLessonDto } from '../models/lesson.interfaces';

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}lessons`;
  
  constructor() { }

  public getAllLessonPopulatedFromCourse = ( courseId : string ) : Observable<LessonPopulated[]> => {
    return this.http
                    .get<LessonPopulatedListResponse>(`${this.baseURL}/detailed/course/${courseId}`)
                    .pipe(
                      map( (lessonResponse) => {
                        console.log(lessonResponse)
                        return LessonMapper.mapResponseToLessonPopulatedArray( lessonResponse );
                      }),
                      catchError( ({ error }) => {
                        console.log(error)
                        return throwError(() => new Error(`${error.errorMessage}`));
                      }),
                    )
  }

  public saveLesson = ( lessonRequest : SaveLessonDto , file ?: File | null ) : Observable<Lesson> => {
    const formData = new FormData();

    const { id , ...rest } = lessonRequest;

    Object.entries( rest ).forEach(([key , value]) => {
      formData.append( key , value as any);
    })

    if(file){
      formData.append( 'files', file );
    }

    if( id ){
      return this.http
            .post<LessonUniqueResponse>(`${this.baseURL}/update/${id}` , formData )
            .pipe(
              map( (lessonResponse) =>{
                console.log(lessonResponse);
                return LessonMapper.mapResponseToLesson( lessonResponse );
              }),
              catchError( ({ error }) => {
                console.log(error)
                return throwError(() => new Error(`${error.errorMessage}`));
              }),
            );
    }
    else{
      return this.http
                  .post<LessonUniqueResponse>(`${this.baseURL}/new` , formData )
                  .pipe(
                    map( (lessonResponse) =>{
                      return LessonMapper.mapResponseToLesson( lessonResponse );
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
