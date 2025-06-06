import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CourseResponse } from '../../interfaces/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}courses`;

  constructor(  ) { 
    
  }

  getAll = ( ) : Observable<CourseResponse> => {
    return this.http.get<CourseResponse>(this.baseURL);
  }

}
