import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UIService } from '@shared/services/ui/ui.service';
import { TeacherRequestResponse, ErrorResponse } from '@shared/models/api.interfaces';
import { TeacherRequestMapper } from '@mappers/teacher-request.mapper';
import { TeacherRequest, TeacherRequestDTO } from '@teacher-request/models/teacher-request.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TeacherRequestService {

  private http = inject(HttpClient);
  private uiService = inject(UIService);
  private baseURL : string = `${environment.apiURL}teacher-requests`;

  // Devuelve la última solicitud del usuario logueado, o null si todavía no solicitó nada.
  public getMyTeacherRequest = ( ) : Observable<TeacherRequest | null> => {
    return this.http
                  .post<TeacherRequestResponse>(`${this.baseURL}/me`, { } )
                    .pipe(
                      map( ( response ) => TeacherRequestMapper.mapApiResponseToTeacherRequest( response ) ),
                      // 404 -> el usuario nunca solicitó ser profesor, no es un error a mostrar.
                      catchError( ( ) => of(null) ),
                    );
  }

  public createTeacherRequest = ( teacherRequestDTO : TeacherRequestDTO ) : Observable<TeacherRequest | false> => {
    return this.http
                  .post<TeacherRequestResponse>(`${this.baseURL}`, { ...teacherRequestDTO } )
                    .pipe(
                      map( ( response ) => TeacherRequestMapper.mapApiResponseToTeacherRequest( response ) ),
                      catchError( ( { error } : { error : ErrorResponse } ) => {
                        this.uiService.showToastMessage( error?.error ?? 'No pudimos enviar tu solicitud, intentá nuevamente.' );
                        return of(false as const);
                      }),
                    );
  }

}
