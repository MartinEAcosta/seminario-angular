import { Component } from '@angular/core';
import { Course } from './Course';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent {

  courses : Course[] = [
    {
      "id" : 1,
      "title" : "Aprendiendo Angular: Seminario - TUDAI",
      "description" :  "A little description...",
      "img": "https://www.shutterstock.com/image-photo/elearning-education-internet-lessons-online-600nw-2158034833.jpg",
      "owner" : "Charles Darwin",
      "duration" : new Date().getTime(),
      "reviews" : 3,
      "price" : 3000,
      "offer" : false,
      "capacity" : 0 
    },
    {
      "id" : 2,
      "title" : "Aprendiendo Angular: Seminario - TUDAI",
      "description" :  "A little description...",
      "img": "../../assets/example.png",
      "owner" : "Charles Darwin",
      "duration" : new Date().getTime(),
      "reviews" : 3,
      "price" : 3000,
      "offer" : false,
      "capacity" : 1,
    },
  ]
  
}
