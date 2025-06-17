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

  ngOnInit(){
    setTimeout(() => console.log(this.courses()), 3000);
  }

}
