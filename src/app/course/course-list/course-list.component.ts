import { ChangeDetectionStrategy, Component, inject, input , InputSignal } from '@angular/core';

import { AuthService } from '../../services/auth/auth.service';
import { BtnPrimaryComponent } from '../../shared/components/btn-primary/btn-primary.component';
import { BtnAddToCartComponent } from '../../shared/components/btn-add-to-cart/btn-add-to-cart.component';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Course } from '../../interfaces/course.interfaces';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-course-list',
    templateUrl: './course-list.component.html',
    styleUrl: './course-list.component.scss',
    imports: [BtnPrimaryComponent, BtnAddToCartComponent, CurrencyPipe, RouterModule, CommonModule],
})
export class CourseListComponent {
  
  readonly courses = input.required<Course[]>();
  
  authService = inject(AuthService);

  readonly user = this.authService.user();

  // ngOnInit(){
  //    setTimeout(() => console.log(this.courses()), 3000);
  // }

}
