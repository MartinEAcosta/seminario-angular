import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Course, CourseApiResponse, CourseResponse } from '../interfaces/course.interfaces';
import { defaultCourses } from '../../utils/defaultCourses';
import { CourseMapper } from '@variables/app/mappers/course.mapper';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private defaultArray = defaultCourses; 
  
  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}courses`;

  getAll = ( ) : Observable<Course[]> => {
    return this.http
                  .get<CourseApiResponse>(`${this.baseURL}`)
                  .pipe(
                      map( ( courseResponse ) => 
                         CourseMapper.mapResponseToCourseArray( courseResponse.data )
                      ),
                      catchError( ( error: any ) => {
                        console.error('Error al obtener todos los cursos, se retornaron los cursos por defecto.');
                        return of( this.defaultArray );
                      }),
                );
  }

  getById = ( id : string ) : Observable<Course>  => {
    return this.http
                  .get<CourseResponse>(`${this.baseURL}/${id}` )
                  .pipe(
                    map( ( courseReponse ) => 
                      CourseMapper.mapResponseToCourse( courseReponse )
                  ),
                  catchError( ( error : any ) => {
                    console.log( error );
                    return of();
                  }),
                  );
  }

  // TODO : REVISAR METODO
  createCourse = ( title : string , description : string , imgURL : string[] , owner : string , price : number , offer : boolean , capacity : number ) : Observable<boolean> => {
    return this.http.post<CourseResponse>(`${this.baseURL}/new` , { title : title , description : description , imgURL : imgURL , owner : owner , price : price , offer : offer, capacity : capacity} )
                      .pipe(
                        map( (resp) => {
                          console.log(resp);
                          return true;
                        }),
                        catchError( (error : any)  => {
                          //TODO : NOTIFICAR ERROR
                          console.log(error);
                          return of(false);
                        }),
                      )
  }

  updateCourse = ( id : string , title : string , description : string , imgURL : string[] , owner : string , price : number , offer : boolean , capacity : number ) : Observable<Course> => {
    return this.http
                  .put<CourseResponse>(
                                        `${this.baseURL}/update/${id}` ,
                                        { 
                                          title : title , description : description , imgURL : imgURL , 
                                          owner : owner , price : price , offer : offer, capacity : capacity
                                        } 
                                      ).pipe( 
                                          map( ( courseResponse ) => {
                                            return CourseMapper.mapResponseToCourse( courseResponse );
                                          }),
                                          catchError( ( error : any ) => {
                                            //TODO : NOTIFICAR ERROR
                                            console.log(error);
                                            return of();
                                          })
                                      );
  }

  deleteCourse = ( id : string ) : Observable<Course> => {
    return this.http
                  .delete<CourseResponse>(`${this.baseURL}/delete/${id}`)
                  .pipe(
                    map( ( courseResponse ) => {
                      return CourseMapper.mapResponseToCourse( courseResponse);
                    }),
                    catchError( ( error : any ) => {
                      // TODO : NOTIFICAR ERROR
                      console.log(error);
                      return of();
                    })
                  );
  }

  // updateImage = ( courseId : string , images ?: FileList ) : Observable<UniqueCourseResponse> => {
  //   console.log(images);
  //   return this.http.put<UniqueCourseResponse>(`${this.baseURL}/update/${courseId}` , { imgURL : images } );
  // }

}
