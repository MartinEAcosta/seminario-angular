/*
  Path:PORT/
*/
import { Component, inject } from '@angular/core';
import { CourseService } from '../../services/course/course.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CourseListComponent } from '../../course/course-list/course-list.component';
import { CartComponent } from '../../shared/components/cart/cart.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
    selector: 'app-home',
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
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
