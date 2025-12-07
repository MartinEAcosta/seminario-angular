import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { Enrollment } from '@enrollment/models/enrollment.interfaces';
import { EnrollmentService } from '@enrollment/services/enrollment.service';
import { LessonService } from '@lesson/services/lesson.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EnrollmentByLessonResolver implements Resolve<Enrollment> {

    router = inject(Router);
    authService = inject(AuthService);
    enrollmentService = inject(EnrollmentService);
    lessonService = inject(LessonService);

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        const user = this.authService.user();
        if( !user ){
            this.router.navigateByUrl('/');
        }
        const lessonId = route.paramMap.get('id_lesson');
        if( !lessonId ){
            this.router.navigateByUrl('/');
        }
        const enrollmentDetailed = this.lessonService.getLessonById(lessonId!).pipe(
          map((lesson) => {
            const userEnrollment = this.enrollmentService.getEnrollmentByUserIdAndCourseId( user!.id , lesson.id_course );
            return {
                enrollment: userEnrollment,
                lesson: lesson
            }
          }),
          catchError((error) => {
            // TODO : Manejar excepción mostrando una pagina de error.
            this.router.navigateByUrl('/');
            return of();
          })
        );
        
        return enrollmentDetailed;
    }
}