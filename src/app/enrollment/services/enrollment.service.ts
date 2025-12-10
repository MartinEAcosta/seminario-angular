import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { EnrollmentPopulatedListResponse, EnrollmentListResponse, EnrollmentPopulatedResponse, EnrollmentResponse } from '@shared/models/api.interfaces';
import { Enrollment, EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';
import { EnrollmentMapper } from '@mappers/enrollment.mapper';

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

  public getEnrollmentPopulatedById = ( id_enrollment : string ) : Observable<EnrollmentDetailed> => {
    return this.http
                    .get<EnrollmentPopulatedResponse>( `${this.baseURL}/${id_enrollment}` )
                    .pipe(
                      map( ( enrollmentResponse ) => { 
                        return EnrollmentMapper.mapResponseToEnrollmentDetailed( enrollmentResponse.data );
                      }),
                      catchError( ({error}) => {
                        console.log(error);
                        return throwError(() => new Error(`${error.errorMessage}`));
                      }),
                    );
  }

  public getEnrollmentsByUserId = ( id_user : string ) : Observable<EnrollmentDetailed[]> => {
    return this.http
                    .get<EnrollmentPopulatedListResponse>( `${this.baseURL}/user/${id_user}` )
                    .pipe(
                      map( ( enrollmentsResponse ) => {
                        return EnrollmentMapper.mapResponseToEnrollmentDetailedArray( enrollmentsResponse );
                      }),
                      catchError( ({error}) => {
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
  


}
  