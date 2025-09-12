import { Component, input } from '@angular/core';
import { Course } from 'src/app/course/models/course.interfaces';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { CourseCardComponent } from "../course-card/course-card.component";

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


}
