import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Course, CourseResponse, UniqueCourseResponse } from '../interfaces/course.interfaces';
import { defaultCourses } from '../../utils/defaultCourses';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private _courses = signal<Course[]>([]);
  private defaultArray = defaultCourses; 
  
  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}courses`;

  getAll = ( ) : Observable<CourseResponse> => {
    return this.http.get<CourseResponse>(`${this.baseURL}`)
                      .pipe(
                        tap( resp => {
                          this._courses.set(resp.courses);
                        }),
                        catchError((error: any) => {
                          const defaultResp: CourseResponse = {
                            ok : true,
                            courses: this.defaultArray,
                          };
                          this._courses.set(this.defaultArray);
                          return of(defaultResp);
                        }),
                      );
  }

  getById = ( id : string ) : Observable<UniqueCourseResponse>  => {
    return this.http.get<UniqueCourseResponse>(`${this.baseURL}/${id}` );
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
                          // Notificar error 
                          console.log(error);
                          return of(false);
                        }),
                      )
  }

  updateCourse = ( id : string , title : string , description : string , imgURL : string[] , owner : string , price : number , offer : boolean , capacity : number ) : Observable<UniqueCourseResponse> => {
    return this.http.put<UniqueCourseResponse>(`${this.baseURL}/update/${id}` , { title : title , description : description , imgURL : imgURL , owner : owner , price : price , offer : offer, capacity : capacity} ).pipe( tap( res => console.log(res)))
  }

  deleteCourse = ( id : string ) : Observable<UniqueCourseResponse> => {
    return this.http.delete<UniqueCourseResponse>(`${this.baseURL}/delete/${id}`);
  }

  // updateImage = ( courseId : string , images ?: FileList ) : Observable<UniqueCourseResponse> => {
  //   console.log(images);
  //   return this.http.put<UniqueCourseResponse>(`${this.baseURL}/update/${courseId}` , { imgURL : images } );
  // }

}
