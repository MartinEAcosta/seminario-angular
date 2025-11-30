import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { EnrollmentDetailedListResponse, EnrollmentListResponse, EnrollmentResponse, LessonPopulatedResponse } from '@shared/models/api.interface';
import { Enrollment, EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';
import { EnrollmentMapper } from '@mappers/enrollment.mapper';
import { LessonPopulated } from '@lesson/models/lesson.interfaces';
import { LessonMapper } from '@mappers/lesson.mapper';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}enrollments`;

  constructor() { }

  public getAllEnrollments = ( ) : Observable<Enrollment[]> => {
    return this.http
                    .get<EnrollmentListResponse>( `${this.baseURL}/` )
                    .pipe(
                      map( ( enrollmentsResponse ) => {
                        return EnrollmentMapper.mapResponseToEnrollmentArray( enrollmentsResponse );
                      }),
                      catchError( ({error}) => {
                        return throwError(() => new Error(`${error.errorMessage}`));
                      }),
                    );
  }

  public getEnrollmentsByUserId = ( id_user : string ) : Observable<EnrollmentDetailed[]> => {
    return this.http
                    .get<EnrollmentDetailedListResponse>( `${this.baseURL}/${id_user}` )
                    .pipe(
                      map( ( enrollmentsResponse ) => {
                        return EnrollmentMapper.mapResponseToEnrollmentDetailedArray( enrollmentsResponse );
                      }),
                      catchError( ({error}) => {
                        console.log(error);
                        return throwError(() => new Error(`${error.errorMessage}`));
                      }),
                    );
  }

  public getEnrollmentByUserIdAndCourseId = ( id_user : string , id_course : string ) : Observable<Enrollment> => {
    return this.http
                    .get<EnrollmentResponse>( `${this.baseURL}/user/${id_user}/course/${id_course}` )
                    .pipe(
                      map( ( enrollmentResponse ) => {
                        return EnrollmentMapper.mapResponseToEnrollment( enrollmentResponse.data );
                      }),
                      catchError( ({error}) => {
                        console.log(error);
                        return throwError(() => new Error(`${error.errorMessage}`));
                      }),
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

}
  