import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Course, CourseDTO } from 'src/app/course/models/course.interfaces';
import { defaultCourses } from '@utils/defaultCourses';
import { CourseMapper } from '@mappers/course.mapper';
import { DeleteResponse, CourseListResponse, CourseResponse } from 'src/app/shared/models/api.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}courses`;


  public getAll = ( ) : Observable<Course[]> => {
    return this.http
                  .get<CourseListResponse>(`${this.baseURL}`)
                  .pipe(
                      map( ( courseResponse ) => {
                        console.log(courseResponse);
                        return CourseMapper.mapResponseToCourseArray( courseResponse );
                      }
                      ),
                      catchError( ( error ) => {
                        // Se retorna un arreglo de cursos por ngdefecto.
                        return of(defaultCourses);
                      }),
                  );
  }

  public getById = ( id : string ) : Observable<Course>  => {
    return this.http
                  .get<CourseResponse>(`${this.baseURL}/${id}` )
                  .pipe(
                    map( ( courseReponse ) => 
                      CourseMapper.mapResponseToCourse( courseReponse.data )
                    ),
                    catchError( ({ error }) => {
                      return throwError(() => new Error(`${error.errorMessage}`));
                    }),
                  );
  }

  public createCourse = ( courseRequest : CourseDTO , file : File | null = null) : Observable<Course> => {
    const formData = new FormData();

    const { id , ...rest } = courseRequest;

    Object.entries( rest ).forEach(([key , value]) => {
      formData.append( key , value as any);
    })

    if(file){
      formData.append( 'files', file );
    }


    return this.http
                  .post<CourseResponse>(  
                                          `${this.baseURL}/new` , 
                                          { 
                                            ...courseRequest,
                                            ...formData,
                                          }
                                        )
                                        .pipe(
                                          map( ( courseResponse ) => {
                                            return CourseMapper.mapResponseToCourse( courseResponse.data )
                                          }),
                                          catchError( ({ error }) => {
                                            console.log(error);
                                            console.error( error.errorMessage )
                                            return throwError(() => new Error(`${error.errorMessage}`));
                                          }),
                                        );
  }

  public updateCourse = ( courseRequest : CourseDTO , file : File | null = null) : Observable<Course> => {
    const formData = new FormData();

    const { id , ...rest } = courseRequest;

    Object.entries( rest ).forEach(([key , value]) => {
      if( value != undefined){
        formData.append( key , value as any);
      }
    })

    if(file){
      formData.append( 'files', file );
    }

    return this.http
                  .put<CourseResponse>(
                                        `${this.baseURL}/update/${id}` ,
                                        formData
                                      )
                                        .pipe( 
                                          map( ( courseResponse ) => {
                                            return CourseMapper.mapResponseToCourse( courseResponse.data );
                                          }),
                                          catchError( ({ error }) => {
                                            console.log(error)
                                            return throwError(() => new Error(`${error.errorMessage}`));
                                          }),
                                        );
  }

  public deleteCourse = ( id : string ) : Observable<boolean> => {
    return this.http
                  .delete<DeleteResponse>(
                                          `${this.baseURL}/delete/${id}`
                                         )
                                        .pipe(
                                          map( ( courseResponse ) => {
                                            return courseResponse.ok;
                                          }),
                                          catchError( ({ error }) => {
                                            console.error( error.errorMessage )
                                            throwError(() => new Error(`${error.errorMessage}`));
                                            return of(false);
                                          }),
                                      );
  }

}
