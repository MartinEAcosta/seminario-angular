import { Component, computed, inject, input } from '@angular/core';
import { Course } from '../../interfaces/course.interfaces';
import { CourseService } from '../../services/course/course.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CourseListComponent } from '../../course/course-list/course-list.component';
import { CartComponent } from '../../shared/components/cart/cart.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [HeaderComponent, CourseListComponent, CartComponent, FooterComponent]
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
