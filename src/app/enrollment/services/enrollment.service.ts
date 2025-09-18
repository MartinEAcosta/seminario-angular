import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { EnrollmentListResponse } from 'src/app/shared/models/api.interface';
import { environment } from 'src/environments/environment';
import { Enrollment } from '../models/enrollment.interfaces';
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

  public getEnrollmentsByUserId = ( id_user : string ) : Observable<Enrollment[]> => {
    return this.http
                    .get<EnrollmentListResponse>( `${this.baseURL}/${id_user}` )
                    .pipe(
                      map( ( enrollmentsResponse ) => {
                        console.log(enrollmentsResponse);
                        return EnrollmentMapper.mapResponseToEnrollmentArray( enrollmentsResponse );
                      }),
                      catchError( ({error}) => {
                        return throwError(() => new Error(`${error.errorMessage}`));
                      }),
                    );
  }


  
}
