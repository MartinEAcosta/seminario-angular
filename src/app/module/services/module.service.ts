import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ModuleMapper } from '@mappers/module.mapper';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '@shared/models/api.interfaces';
import { ModulePopulatedResponseDto, ModuleResponseDto } from '@module/models/module.response';
import { Module, ModulePopulated } from '../models/module.interface';
import { ModuleDTO } from '../models/module.request';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}modules`;

  constructor() { }

  public saveModule = ( moduleRequest : ModuleDTO ) : Observable<Module> => {
    const { id , ...rest } = moduleRequest;

    if( id ){
      return this.http
                    .put<ApiResponse<ModuleResponseDto>>(`${this.baseURL}/update/${id}` , moduleRequest )
                    .pipe(
                    map(( modulesResponse ) => {
                      return ModuleMapper.mapResponseToModule(modulesResponse.data);
                    }),
                    catchError( error => {
                      return throwError(() => new Error(`${error.errorMessage}`));
                    }),
                  );
    }
    else{
      return this.http
                    .post<ApiResponse<ModuleResponseDto>>(`${this.baseURL}/new` , rest )
                    .pipe(
                    map(( modulesResponse ) => {
                      return ModuleMapper.mapResponseToModule(modulesResponse.data);
                    }),
                    catchError( error => {
                      return throwError(() => new Error(`${error.errorMessage}`));
                    }),
                  );
    }
  }

  public getModulesByCourseId = ( id_course : string ) : Observable<ModulePopulated[]> => {
    return this.http
                .get<ApiResponse<ModulePopulatedResponseDto[]>>(`${this.baseURL}/course/detailed/${id_course}`)
                .pipe(
                  map(( modulesResponse ) => {
                    return ModuleMapper.mapResponseToModulePopulatedArray(modulesResponse);
                  }),
                  catchError( error => {
                    return throwError(() => new Error(`${error.errorMessage}`));
                  }),
                );
  }

}
