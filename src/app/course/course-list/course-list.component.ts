import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course.interfaces';
import { AuthService } from '../../services/auth/auth.service';
import { BtnPrimaryComponent } from '../../shared/components/btn-primary/btn-primary.component';
import { BtnAddToCartComponent } from '../../shared/components/btn-add-to-cart/btn-add-to-cart.component';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-course-list',
    templateUrl: './course-list.component.html',
    styleUrl: './course-list.component.scss',
    imports: [BtnPrimaryComponent, BtnAddToCartComponent, CurrencyPipe,
    CommonModule, RouterModule,]
})
export class CourseListComponent {
  
  courses = input.required<Course[] | undefined>();

  authService = inject(AuthService);

  

  constructor ( ) {
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
