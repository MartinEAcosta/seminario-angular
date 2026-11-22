import { Component, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { CourseFormState } from '../../state/course-form/course-form-state';
import { Course } from '@course/models/course.model';

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [
    RouterLink, RouterLinkActive, RouterOutlet,
  ],
})
export class FormCourseComponent {

  public courseFormState = inject(CourseFormState);

  course = input.required<Course | null>();

  constructor ( ) { }

  ngOnInit(): void {
    const course = this.course();
    if (course) {
      this.courseFormState.patchValuesForm(course);
    }
    else{
      this.courseFormState.reset();
    }
  }

  ngOnDestroy() {
    this.courseFormState.reset();
  }

}
