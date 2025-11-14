import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Course, CourseDTO } from 'src/app/course/models/course.interfaces';
import { CourseMapper } from '@mappers/course.mapper';
import { DeleteResponse, CourseResponse, PaginationResponseDto, PaginationResponse } from 'src/app/shared/models/api.interface';
import { FileService } from 'src/app/shared/services/file/file.service';
import { PaginationMapper } from '@mappers/pagination.mapper';

interface Options {
  page ?: number,
  limit ?: number,
  title ?: string,
}


@Injectable({
  providedIn: 'root',
})
export class CourseService {

  private fileService = inject(FileService);
  private http = inject(HttpClient);
  private baseURL: string = `${environment.apiURL}courses`;

  public getAll = ( query ?: string , page ?: number, limit ?: number ): Observable<PaginationResponseDto<Course[]>> => {
    const params : any = {
      current_page : page ?? 1,
      limit : limit ?? 10,
    }

    if( query ) {
      params.title = query.toLowerCase();
    }
  
    return this.http.get<PaginationResponse<Course[]>>(`${this.baseURL}`, { 
      params : params,
    })
    .pipe(
      map((courseResponse) => {
        console.log(courseResponse);
        return PaginationMapper.mapToPaginationDto<Course[]>( courseResponse );
      }),
      catchError((error) => {
        // Se retorna un arreglo de cursos por ngdefecto.
        // return of(defaultCourses);
        return of();
      })
    );
  };

  //* Deja de ser tan necesario debido a los filtros implementados en el getAll
  // public getCoursesPaginated = ( page : number , limit ?: number) : Observable<PaginationResponseDto<Course[]>> => {
  //   return this.http.get<PaginationResponse<Course[]>>(`${this.baseURL}/paginated` , 
  //     { 
  //       params : 
  //         { 
  //           page : page ,
  //           limit : limit ?? 2,
  //         }
  //     }
  //   ).pipe(
  //     map((courseResponse) => {
  //       console.log(courseResponse)
  //       return PaginationMapper.mapToPaginationDto<Course[]>( courseResponse );
  //     }),
  //     catchError(({error}) => {
  //       return throwError(() => new Error(`${error.errorMessage}`));
  //     })
  //   )
  // }

  public getById = (id: string): Observable<Course> => {
    return this.http.get<CourseResponse>(`${this.baseURL}/${id}`).pipe(
      map((courseResponse) =>
        CourseMapper.mapResponseToCourse(courseResponse.data)
      ),
      catchError(({ error }) => {
        return throwError(() => new Error(`${error.errorMessage}`));
      })
    );
  };

  public saveCourse = ( courseRequest: CourseDTO, file: File | null = null ): Observable<Course> => {
    const { id, ...rest } = courseRequest;

    let course;
    if (id) {
      course = this.http
        .put<CourseResponse>(`${this.baseURL}/update/${id}`, rest)
        .pipe(
          map((courseResponse) => {
            course = CourseMapper.mapResponseToCourse(courseResponse.data);
            if( file ){
              this.fileService.uploadFile( 'courses' , course.id , file ).subscribe()
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
        .post<CourseResponse>(`${this.baseURL}/new`, rest)
        .pipe(
          map((courseResponse) => {
            course = CourseMapper.mapResponseToCourse(courseResponse.data);
            if( file ){
              this.fileService.uploadFile( 'courses' , course.id , file ).subscribe()
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
      .delete<DeleteResponse>(`${this.baseURL}/delete/${id}`)
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
