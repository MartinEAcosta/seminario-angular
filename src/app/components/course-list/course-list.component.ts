import { Component, inject, OnInit } from '@angular/core';
import { Course } from '../../interfaces/course.interfaces';
import { CourseService } from '../../services/course/course.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent implements OnInit {

  courses : Course[] = [];
  errorMessage : String = '';
  
  // Forma recomendada por angularde instaciar elservicio. 
  public courseService = inject(CourseService);

  constructor ( ) { }

  ngOnInit() : void { 
    this.loadCourses();
   }

  loadCourses() : void  {
    this.courseService.getAll().subscribe({
      next: ( data ) => {
        console.log(data);
        this.courses = data.courses;
      },
      error: ( error ) =>{
        this.errorMessage = error.errorMessage;
        console.log(this.errorMessage)
      }
    });
  }
  

  // courses : Course[] = [
  //   {
  //     "id" : 1,
  //     "title" : "Aprendiendo Angular: Seminario - TUDAI",
  //     "description" :  "A little description...",
  //     "img": "https://www.shutterstock.com/image-photo/elearning-education-internet-lessons-online-600nw-2158034833.jpg",
  //     "owner" : "Charles Darwin",
  //     "duration" : new Date().getTime(),
  //     "reviews" : 3,
  //     "price" : 3000,
  //     "offer" : false,
  //     "capacity" : 0 
  //   },
  //   {
  //     "id" : 2,
  //     "title" : "Aprendiendo Angular: Seminario - TUDAI",
  //     "description" :  "A little description...",
  //     "img": "../../assets/example.png",
  //     "owner" : "Charles Darwin",
  //     "duration" : new Date().getTime(),
  //     "reviews" : 3,
  //     "price" : 3000,
  //     "offer" : false,
  //     "capacity" : 3,
  //   },
  // ]
  
}
