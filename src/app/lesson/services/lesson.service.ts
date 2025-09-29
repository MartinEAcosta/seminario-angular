import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Lesson, LessonPopulated } from '../models/lesson.interfaces';
import { catchError, map, Observable, throwError } from 'rxjs';
import { LessonMapper } from '@mappers/lesson.mapper';
import { LessonListResponse, LessonPopulatedListResponse, LessonResponse } from 'src/app/shared/models/api.interface';

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}lessons`;
  
  constructor() { }

  public getAllLessonFromCourse = ( courseId : string ) : Observable<LessonPopulated[]> => {
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

  
}
