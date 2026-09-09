import { Component, input } from '@angular/core';

import { FormCourseComponent } from "@course/components/form-course/form-course.component";
import { Course } from '@course/models/course.interfaces';

@Component({
  selector: 'app-update-course-page',
  imports: [FormCourseComponent],
  templateUrl: './update-course-page.html',
  styleUrl: './update-course-page.scss'
})

export class UpdateCoursePageComponent {

  resolvedCourse = input<Course>();

  constructor (  ) {  }

}
