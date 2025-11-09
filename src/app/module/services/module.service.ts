import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ModuleMapper } from '@mappers/module.mapper';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ModulePopulatedListResponse } from 'src/app/shared/models/api.interface';
import { environment } from 'src/environments/environment';
import { Module, ModuleDTO, ModulePopulated } from '../models/module.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}modules`;

  constructor() { }

  public saveModule = ( moduleRequest : ModuleDTO ) : Observable<Module> => {
    return this.http
                  .post<any>(`${this.baseURL}/new` , moduleRequest )
                  .pipe(
                  map(( modulesResponse ) => {
                    console.log(modulesResponse);
                    return ModuleMapper.mapResponseToModule(modulesResponse);
                  }),
                  catchError( error => {
                    return throwError(() => new Error(`${error.errorMessage}`));
                  }),
                );
  }

  public getModulesByCourseId = ( id_course : string ) : Observable<ModulePopulated[]> => {
    return this.http
                .get<ModulePopulatedListResponse>(`${this.baseURL}/course/detailed/${id_course}`)
                .pipe(
                  map(( modulesResponse ) => {
                    console.log(modulesResponse);
                    return ModuleMapper.mapResponseToModulePopulatedArray(modulesResponse);
                  }),
                  catchError( error => {
                    return throwError(() => new Error(`${error.errorMessage}`));
                  }),
                );
  }

}
