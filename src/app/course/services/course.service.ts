import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Course, CourseDTO, CoursePopulated } from '@course/models/course.interfaces';
import { CourseMapper } from '@mappers/course.mapper';
import { ApiResponse, CoursePopulatedResponseDto, CourseResponseDto, PaginationResponse, PaginationResponseDto } from '@shared/models/api.interfaces';
import { FileService } from '@file/services/file.service';
import { PaginationMapper } from '@mappers/pagination.mapper';
import { buildExploreQueryParams } from '@course/utils/obtainOptionsParams';

export type Options = {
  page ?: number,
  limit ?: number,
  title ?: string;
  id_category?: string;
  category_name?: string;
  minPrice?: string;
  maxPrice?: string;
  notFullyEnrolled?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {

  private fileService = inject(FileService);
  private http = inject(HttpClient);
  private baseURL: string = `${environment.apiURL}courses`;

  public getAll = ( options ?: Options ): Observable<PaginationResponseDto<Course>> => {
    const params = options ? buildExploreQueryParams( options ) : { };

    return this.http.get<PaginationResponse<CourseResponseDto>>(`${this.baseURL}`, {
      params,
    })
    .pipe(
      map((courseResponse) => {
        return PaginationMapper.mapToPaginationDto( courseResponse, CourseMapper.mapResponseToCourse );
      }),
      catchError((error) => {
        console.log(error);
        return of({
          items: [],
          pages: 0,
          current_page: 1,
          limit: 0,
          total: 0,
          next: null,
          prev: null,
        });
      })
    );
  };

  public getById = (id: string): Observable<Course> => {
    return this.http.get<ApiResponse<CourseResponseDto>>(`${this.baseURL}/${id}`).pipe(
      map((courseResponse) => {

        return CourseMapper.mapResponseToCourse(courseResponse.data);
      }
      ),
      catchError(({ error }) => {
        console.log(error);
        return throwError(() => new Error(`${error.errorMessage}`));
      })
    );
  };

  // Mismo curso que `getById` pero con el profesor resuelto por el backend.
  // Devuelve `Course` igual que el resto: el owner anidado se aplana en el
  // mapper, así los componentes siguen leyendo `owner_name`/`owner_bio`.
  public getDetailedById = ( id : string ) : Observable<CoursePopulated> => {
    return this.http.get<ApiResponse<CoursePopulatedResponseDto>>(`${this.baseURL}/detailed/${id}`)
      .pipe(
        map(( courseResponse ) => CourseMapper.mapPopulatedResponseToCourse( courseResponse.data )),
        catchError(({ error }) => {
          console.log(error);
          return throwError(() => new Error(`${error?.errorMessage}`));
        })
      );
  }

  public saveCourse = ( courseRequest: CourseDTO, file: File | null = null ): Observable<Course> => {
    const { id, ...rest } = courseRequest;
    let course;
    if (id) {
      course = this.http
        .put<ApiResponse<CourseResponseDto>>(`${this.baseURL}/update/${id}`, rest)
        .pipe(
          map((courseResponse) => {
            course = CourseMapper.mapResponseToCourse(courseResponse.data);
            if( file ){
              this.fileService.uploadFile( 'course' , course.id , file ).subscribe()
            }
            return course;
          }),
          catchError(({ error }) => {
            console.log(error);
            return throwError(() => new Error(`${error.errorMessage}`));
          })
        );
    } 
    else {
      course = this.http
        .post<ApiResponse<CourseResponseDto>>(`${this.baseURL}/new`, rest)
        .pipe(
          map((courseResponse) => {
            course = CourseMapper.mapResponseToCourse(courseResponse.data);
            if( file ){
              this.fileService.uploadFile( 'course' , course.id , file ).subscribe()
            }
            return course;
          }),
          catchError(({ error }) => {
            console.log(error);
            console.error(error.errorMessage);
            return throwError(() => new Error(`${error.errorMessage}`));
          })
        );

      }
    return course;
  };

  public deleteCourse = (id: string): Observable<boolean> => {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.baseURL}/delete/${id}`)
      .pipe(
        map((courseResponse) => {
          return courseResponse.ok;
        }),
        catchError(({ error }) => {
          console.error(error.errorMessage);
          throwError(() => new Error(`${error.errorMessage}`));
          return of(false);
        })
      );
  };
}
