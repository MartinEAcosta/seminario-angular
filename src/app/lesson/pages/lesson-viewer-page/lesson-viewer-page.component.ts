import { Component, input } from '@angular/core';
import { Course } from '@course/models/course.interfaces';
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";

@Component({
  selector: 'app-lesson-viewer-page',
  imports: [ ListOfContentComponent ],
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss'
})
export class LessonViewerPageComponent {
  
  resolvedCourse = input.required<Course>();

}
