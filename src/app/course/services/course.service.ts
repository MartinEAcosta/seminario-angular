import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Course, CourseApiResponse, CourseDTO, CourseListApiResponse, CourseResponse } from '@interfaces/course.interfaces';
import { defaultCourses } from '@utils/defaultCourses';
import { CourseMapper } from '@mappers/course.mapper';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}courses`;

  getAll = ( ) : Observable<Course[]> => {
    return this.http
                  .get<CourseListApiResponse>(`${this.baseURL}`)
                  .pipe(
                      map( ( courseResponse ) => 
                        CourseMapper.mapResponseToCourseArray( courseResponse.data )
                      ),
                      catchError( ( ) => {
                        // Se retorna un arreglo de cursos por defecto.
                        return of(defaultCourses);
                      }),
                  );
  }

  getById = ( id : string ) : Observable<Course>  => {
    return this.http
                  .get<CourseApiResponse>(`${this.baseURL}/${id}` )
                  .pipe(
                    map( ( courseReponse ) => 
                      CourseMapper.mapResponseToCourse( courseReponse.data )
                  ),
                  catchError( ({ error }) => {
                    console.error( error.errorMessage )
                    return throwError(() => new Error(`${error.errorMessage}`));
                  }),
                  );
  }

  // TODO : REVISAR METODO
  createCourse = ( courseRequest : CourseDTO ) : Observable<Course> => {
    return this.http
                  .post<CourseResponse>(
                                        `${this.baseURL}/new` , 
                                        { 
                                          ...courseRequest
                                        } 
                                      ).pipe(
                                          map( ( courseResponse ) => {
                                            return CourseMapper.mapResponseToCourse( courseResponse );
                                          }),
                                          catchError( ({ error }) => {
                                            console.error( error.errorMessage )
                                            return throwError(() => new Error(`${error.errorMessage}`));
                                          }),
                                        );
  }

  updateCourse = ( courseRequest : CourseDTO ) : Observable<Course> => {
    return this.http
                  .put<CourseResponse>(
                                        `${this.baseURL}/update/${courseRequest._id}` ,
                                        { 
                                          ...courseRequest
                                        } 
                                      ).pipe( 
                                          map( ( courseResponse ) => {
                                            return CourseMapper.mapResponseToCourse( courseResponse );
                                          }),
                                          catchError( ({ error }) => {
                                            console.error( error.errorMessage )
                                            return throwError(() => new Error(`${error.errorMessage}`));
                                          }),
                                        );
  }

  deleteCourse = ( id : string ) : Observable<Course> => {
    return this.http
                  .delete<CourseResponse>(`${this.baseURL}/delete/${id}`)
                  .pipe(
                    map( ( courseResponse ) => {
                      return CourseMapper.mapResponseToCourse( courseResponse );
                    }),
                    catchError( ({ error }) => {
                      console.error( error.errorMessage )
                      return throwError(() => new Error(`${error.errorMessage}`));
                    }),
                  );
  }

  // updateImage = ( courseId : string , images ?: FileList ) : Observable<UniqueCourseResponse> => {
  //   console.log(images);
  //   return this.http.put<UniqueCourseResponse>(`${this.baseURL}/update/${courseId}` , { imgURL : images } );
  // }

}
