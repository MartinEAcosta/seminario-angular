import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Course, CourseDTO } from '@interfaces/course.interfaces';
import { defaultCourses } from '@utils/defaultCourses';
import { CourseMapper } from '@mappers/course.mapper';
import { CourseListResponse, CourseResponse, FileResponse } from 'src/app/shared/interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}courses`;

  getAll = ( ) : Observable<void | Course[]> => {
    return this.http
                  .get<CourseListResponse>(`${this.baseURL}`)
                  .pipe(
                      map( ( courseResponse ) => {
                        // console.log(courseResponse);
                        return CourseMapper.mapResponseToCourseArray( courseResponse );
                      }
                      ),
                      catchError( (error ) => {
                        // Se retorna un arreglo de cursos por defecto.
                        return of(defaultCourses);
                      }),
                  );
  }

  getById = ( id : string ) : Observable<Course>  => {
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

  // TODO : REVISAR METODO
  createCourse = ( courseRequest : CourseDTO ) : Observable<Course> => {
    return this.http
                  .post<CourseResponse>(
                                        `${this.baseURL}/new` , 
                                        {...courseRequest}
                                      ).pipe(
                                          map( ( courseResponse ) => {
                                            console.log(courseResponse);
                                            return CourseMapper.mapResponseToCourse( courseResponse.data )
                                          }
                                          ),
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
                                            return CourseMapper.mapResponseToCourse( courseResponse.data );
                                          }),
                                          catchError( ({ error }) => {
                                            console.error( error.errorMessage )
                                            return throwError(() => new Error(`${error.errorMessage}`));
                                          }),
                                        );
  }

  deleteCourse = ( id : string ) : Observable<boolean> => {
    return this.http
                  .delete<CourseResponse>(
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

  // getCategories = ( ) : Observable<Category> => {

  // }
  
  updateImage = ( images : FileList ) => {
    return this.http
                    .post<FileResponse>(
                                        `${this.baseURL}/upload/single/course`, 
                                        images,
                                      )
                                      .pipe(
                                        map( res => {
                                          console.log(res);
                                          return;
                                        }),
                                        catchError( error => error),
                                      );
  }

}
