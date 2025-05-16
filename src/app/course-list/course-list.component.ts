import { Component } from '@angular/core';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent {

  course = {
    "title" : "Aprendiendo Angular: Seminario - TUDAI",
    "description" :  "A little description...",
    "owner" : "Charles Darwin",
    "duration" : "20:00:00",
    "reviews" : 3,
    "price" : 3000,
    "offer" : false,
  }
}
