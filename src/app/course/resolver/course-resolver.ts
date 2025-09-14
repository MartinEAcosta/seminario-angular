import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { CourseService } from '../services/course.service';
import { Course } from '@interfaces/course.interfaces';

export const CourseResolver: ResolveFn<Course> = ( route : ActivatedRouteSnapshot , state : RouterStateSnapshot) => {

  const courseService = inject(CourseService);

  const courseId = route.paramMap.get('id');
  
  return courseService.getById( courseId! );
};
