import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '@shared/models/api.response';
import { TeacherRequestResponseDto } from '@teacher-request/models/teacher-request.response';
import { TeacherRequestMapper } from '@mappers/teacher-request.mapper';
import { TeacherRequest, TeacherRequestDTO } from '@teacher-request/models/teacher-request.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherRequestService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}teacher-requests`;

  // Devuelve la última solicitud del usuario logueado, o null si todavía no solicitó nada.
  public getMyTeacherRequest = ( ) : Observable<TeacherRequest | null> => {
    return this.http
                  .post<ApiResponse<TeacherRequestResponseDto>>(`${this.baseURL}/me`, { } )
                    .pipe(
                      map( ( response ) => TeacherRequestMapper.mapApiResponseToTeacherRequest( response ) ),
                      // Solo el 404 significa "nunca solicitó" y se traduce a null. Tragarse
                      // cualquier error haría que un 500 o el backend caído rendericen el
                      // formulario vacío como si el usuario no tuviera solicitud, y el reenvío
                      // choque después contra la regla de duplicados del backend.
                      catchError( ( error : HttpErrorResponse ) =>
                        error.status === 404 ? of(null) : throwError( () => error )
                      ),
                    );
  }

  public createTeacherRequest = ( teacherRequestDTO : TeacherRequestDTO ) : Observable<TeacherRequest> => {
    return this.http
                  .post<ApiResponse<TeacherRequestResponseDto>>(`${this.baseURL}`, { ...teacherRequestDTO } )
                    .pipe(
                      map( ( response ) => TeacherRequestMapper.mapApiResponseToTeacherRequest( response ) ),
                      catchError( ( error ) => throwError( () => error ) ),
                    );
  }

}
