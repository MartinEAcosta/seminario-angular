import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import {  Observable, tap } from 'rxjs';
import { Course, CourseResponse } from '../../interfaces/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
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
                      );
  }
}
