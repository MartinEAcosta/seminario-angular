import { Component, input } from '@angular/core';
import { Course } from '../../models/course.interfaces';


@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent {

  selectedCourse = input.required<Course>();

}
