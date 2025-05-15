import { Component } from '@angular/core';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent {

  private course = {
    "title" : "Aprendiendo Angular: Seminario - TUDAI",
    "duration" : "20:00:00",
    "price" : 3000,
    "offer" : false,
  }
}
