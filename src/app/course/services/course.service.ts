import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Course, CourseDTO } from 'src/app/course/models/course.interfaces';
import { defaultCourses } from '@utils/defaultCourses';
import { CourseMapper } from '@mappers/course.mapper';
import { DeleteResponse, CourseListResponse, CourseResponse } from 'src/app/shared/models/api.interface';
import { FileService } from 'src/app/shared/services/file/file.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {

  private fileService = inject(FileService);
  private http = inject(HttpClient);
  private baseURL: string = `${environment.apiURL}courses`;

  public getAll = (): Observable<Course[]> => {
    return this.http.get<CourseListResponse>(`${this.baseURL}`).pipe(
      map((courseResponse) => {
        return CourseMapper.mapResponseToCourseArray(courseResponse);
      }),
      catchError((error) => {
        // Se retorna un arreglo de cursos por ngdefecto.
        return of(defaultCourses);
      })
    );
  };

  public getById = (id: string): Observable<Course> => {
    return this.http.get<CourseResponse>(`${this.baseURL}/${id}`).pipe(
      map((courseReponse) =>
        CourseMapper.mapResponseToCourse(courseReponse.data)
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
