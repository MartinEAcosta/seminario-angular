import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Course } from '../components/course-list/Course';
import { Observable } from 'rxjs';
import { CourseResponse } from '../DTO/CourseResponse';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private baseURL : string = `${environment.apiURL}courses`;

  constructor( private http : HttpClient ) { 

  }

  getAll( ) : Observable<CourseResponse> {
    return this.http.get<CourseResponse>(this.baseURL);
  }

}
