import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject } from '@angular/core';

import { CourseService } from 'src/app/course/services/course.service';
import { CourseMapper } from '@mappers/course.mapper';
import { FormCourseComponent } from "src/app/course/components/form-course/form-course.component";
import { CourseFormState } from '../../state/course/course-form-state';
import { Course } from '@course/models/course.interfaces';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-update-course-page',
  imports: [FormCourseComponent],
  templateUrl: './update-course-page.html',
  styleUrl: './update-course-page.scss'
})

export class UpdateCoursePageComponent {
  
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  public courseFormState = inject(CourseFormState);

  course = toSignal<Course | null>( this.activatedRoute.data
                                          .pipe(
                                            map( data => {
                                              const resolvedCourse =  data['resolvedCourse'];
                                              if( !resolvedCourse ) {
                                                throw new Error('Error al obtener el curso')
                                              }
                                              return resolvedCourse;
                                            }),
                                            catchError( (error) => {
                                              return of(null);
                                            })
                                          ), { initialValue : null  });
  
  constructor (  ) {  }

  public onUpdateCourse = ( course : Course ) : void => {
    const updateCourseDTO = CourseMapper.mapToCourseDto( this.courseFormState.courseForm , this.courseFormState.limitedCapacity() );

    updateCourseDTO.id = course?.id!;

    if( !this.courseFormState.thumbnailFile() ){
      updateCourseDTO.id_file = course?.id_file!;
      updateCourseDTO.thumbnail_url = course?.thumbnail_url!;
    }
    
    this.courseService.saveCourse( updateCourseDTO , this.courseFormState.thumbnailFile() )
                        .subscribe(
                          ( course ) => {
                            this.courseFormState.reset();
                            this.router.navigate([`/courses/${ course.id }`]);
                          },
                        );
  }

  public onRemoveCourse = ( course : Course )  => {
    if( course.id_owner === this.authService.id() ){
      this.courseService.deleteCourse( course.id )
                            .subscribe( (isCourseDeleted) => {
                                if( isCourseDeleted ) {
                                  this.courseFormState.reset();
                                  this.router.navigateByUrl('/');
                                  return;
                                }     
                            } );
    }
  }

}
