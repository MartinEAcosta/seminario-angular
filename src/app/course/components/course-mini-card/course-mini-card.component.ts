import { Component, input } from '@angular/core';
import { Course } from '@interfaces/course.interfaces';

@Component({
  selector: 'app-course-mini-card',
  imports: [],
  templateUrl: './course-mini-card.component.html',
  styleUrls: ['../../../shared/styles/mini-card-component.scss' ,'./course-mini-card.component.scss']
})
export class CourseMiniCardComponent {

  course = input.required<Course>();
}
