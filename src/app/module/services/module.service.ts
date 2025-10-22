import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ModuleMapper } from '@mappers/module.mapper';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ModuleListResponse } from 'src/app/shared/models/api.interface';
import { environment } from 'src/environments/environment';
import { Module } from '../models/module.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}modules`;

  constructor() { }

  public getModulesByCourseId = ( id_course : string ) : Observable<Module[]> => {

    return this.http
                .get<ModuleListResponse>(`${this.baseURL}course/id_course`)
                .pipe(
                  map(( modulesResponse ) => {
                    return ModuleMapper.mapResponseToModuleArray( modulesResponse );
                  }),
                  catchError( error => {
                    return throwError(() => new Error(`${error.errorMessage}`));
                  }),
                );
  }

}
