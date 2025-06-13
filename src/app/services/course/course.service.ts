import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import {  catchError, Observable, of, tap } from 'rxjs';
import { Course, CourseResponse } from '../../interfaces/course.interfaces';
import { defaultCourses } from '../../course/defaultCourses';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private defaultArray = defaultCourses; 
  private _courses = signal<Course[]>([]);
  
  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}courses`;

  readonly courses = computed( () => this._courses() );

  constructor(  ) { 
    this.getAll();
  }

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

  createCourse = ( title : string , description : string , owner : string , price : number , offer : boolean , capacity : number ) : Observable<CourseResponse> => {
    return this.http.post<CourseResponse>(`${this.baseURL}/new` , { title , description , owner , price , offer , capacity } )
                      .pipe(
                        tap( resp => {
                          console.log(resp);
                        }),
                        catchError( (error : any)  => {
                          // Notificar error 
                          const defaultResp: CourseResponse = {
                            ok: false,
                            courses: [],
                          };
                          return of(defaultResp);
                        }),
                      )
  }
}
