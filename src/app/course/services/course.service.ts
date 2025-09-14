import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Course, CourseDTO } from 'src/app/course/models/course.interfaces';
import { defaultCourses } from '@utils/defaultCourses';
import { CourseMapper } from '@mappers/course.mapper';
import { CourseListResponse, CourseResponse } from 'src/app/shared/models/api.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}courses`;

  private fb = inject(FormBuilder)

  selectedCourse = signal<Course | null>(null);

  public getAll = ( ) : Observable<void | Course[]> => {
    return this.http
                  .get<CourseListResponse>(`${this.baseURL}`)
                  .pipe(
                      map( ( courseResponse ) => {
                        console.log(courseResponse);
                        return CourseMapper.mapResponseToCourseArray( courseResponse );
                      }
                      ),
                      catchError( (error ) => {
                        // Se retorna un arreglo de cursos por defecto.
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

  // TODO : REVISAR METODO
  public createCourse = ( courseRequest : CourseDTO ) : Observable<Course> => {
    return this.http
                  .post<CourseResponse>(
                                        `${this.baseURL}/new` , 
                                        {...courseRequest}
                                      ).pipe(
                                          map( ( courseResponse ) => {
                                            // console.log(courseResponse);
                                            return CourseMapper.mapResponseToCourse( courseResponse.data )
                                          }
                                          ),
                                          catchError( ({ error }) => {
                                            console.log(error);
                                            console.error( error.errorMessage )
                                            return throwError(() => new Error(`${error.errorMessage}`));
                                          }),
                                        );
  }

  public updateCourse = ( courseRequest : CourseDTO ) : Observable<Course> => {
    const { id , ...rest } = courseRequest;
    console.log(courseRequest);
    return this.http
                  .put<CourseResponse>(
                                        `${this.baseURL}/update/${id}` ,
                                        { 
                                          ...rest
                                        } 
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

  public createForm = ( ) : FormGroup => {
    return this.fb.group({
      title : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      description : [ '' , [ Validators.required,  Validators.minLength(6) ] ],
      id_category : [ ' '  ],
      thumbnail_url : [ '' ],
      price : [ 0 , [ Validators.required ] ],
      wantLimitedCapacity: [ true ],
      capacity : [ { value : 5 , disabled: false } , [ Validators.min(5) ] ], 
    });
  }

  public patchValuesForm = ( course : Course , form : FormGroup ) : FormGroup => {
    form.patchValue({
      title: course.title,
      description: course.description,
      id_category: course.id_category,
      thumbnail_url: course.thumbnail_url,
      price: course.price,
      capacity: course.capacity
    });

    return form;
  }
}
