import { Component, input } from '@angular/core';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { CourseCardComponent } from "../course-card/course-card.component";
import { Course } from '@course/models/course.interfaces';

@Component({
  selector: 'app-course-list',
  imports: [LoaderComponent, CourseCardComponent],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent {

  courses = input.required<Course[]>();
  isLoading = input<boolean>(false);
  errorMessage = input<string | unknown | null>();

  constructor() { }
}
