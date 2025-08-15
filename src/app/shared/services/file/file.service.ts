import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { FileMapper } from '@mappers/file.mapper';
import { FileResponse } from '../../interfaces/api.interface';
import { UploadedFile } from '../../interfaces/file.interface';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}upload`;

  uploadImages = ( folder : string , images?: FileList ) : Observable<UploadedFile[]> => {
    if( !images ) return of([]);

    const uploadObservable = Array.from( images ).map( (imageFile) => 
      this.uploadImage( folder, imageFile )
    );
    // Se encarga de esperar hasta todas las peticiones emitan un valor, en caso de fallar
    // vuelve hacia atras
    return forkJoin(uploadObservable);
  }
  
  uploadImage = ( folder : string, image : File  ) : Observable<UploadedFile> => {
    const formData = new FormData( );
    formData.append( 'files', image );
    return this.http
                    .post<FileResponse>(
                                        `${this.baseURL}/single/${folder}`, 
                                        formData,
                                      )
                                      .pipe(
                                        map( fileResponse => {
                                          return FileMapper.mapResponseToFile( fileResponse.data );
                                        }),
                                        catchError( ({ error }) => {
                                                              return throwError(() => new Error(`${error}`));
                                        }),
                                      );
  }

  getImageByPublicId = ( public_id : string ) => {
    return this.http
                .get<FileResponse>(
                                    `${this.baseURL}/get/${public_id}`
                                  )
                                  .pipe(
                                    map( res => {
                                      console.log(res);
                                      return res;
                                    }),
                                    catchError( error => error),
                                  )
  }

}
