import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}lessons`;
  
  constructor() { }

  
}
