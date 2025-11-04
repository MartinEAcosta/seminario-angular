import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { EnrollmentDetailedListResponse, EnrollmentListResponse } from 'src/app/shared/models/api.interface';
import { environment } from 'src/environments/environment';
import { Enrollment, EnrollmentDetailed } from '../models/enrollment.interfaces';
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


  
}
