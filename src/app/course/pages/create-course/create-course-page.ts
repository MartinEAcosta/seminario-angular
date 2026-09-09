import { Component } from '@angular/core';

import { FormCourseComponent } from "../../components/form-course/form-course.component";

@Component({
  selector: 'app-create-course-page',
  imports: [FormCourseComponent],
  templateUrl: './create-course-page.html',
  styleUrl: './create-course-page.scss',
})
export class CreateCoursePageComponent {

  constructor ( ) { }

}
