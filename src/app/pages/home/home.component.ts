import { Component, computed, inject, input } from '@angular/core';
import { Course } from '../../interfaces/course.interfaces';
import { CourseService } from '../../services/course/course.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  courseService = inject(CourseService);

  // Permite tratar de manera asincronica las respuestas de los observables
  coursesResource = rxResource({
    loader: (() => {
      return this.courseService.getAll();
    })
  });

}
