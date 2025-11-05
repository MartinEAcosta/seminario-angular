import { Component, inject, input } from '@angular/core';
import { Course } from '@course/models/course.interfaces';
import { UserState } from 'src/app/auth/state/user-state';


@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent {

  course = input.required<Course>();

  constructor(){ }

}
