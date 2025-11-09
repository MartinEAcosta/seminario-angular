import { CategoryListResponse } from './../../shared/models/api.interface';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, catchError, map, of } from 'rxjs';
import { Category } from '../models/category.interfaces';
import { CategoryMapper } from '@mappers/category.mapper';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}categories`;

  constructor() { }

  public getAllCategories = ( ) : Observable<Category[]> => {
    return this.http
                  .get<CategoryListResponse>(`${this.baseURL}`)
                    .pipe(
                      map( ( categoryResponse ) => {
                          console.log(categoryResponse);
                          return CategoryMapper.mapResponseToCategoriesArray( categoryResponse );
                      }),
                    );
  }

}
