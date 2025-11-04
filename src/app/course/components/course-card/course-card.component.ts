import { Component, inject, input } from '@angular/core';

import { AuthService } from '../../../auth/services/auth.service';
import { BtnPrimaryComponent } from '../../../shared/components/btn-primary/btn-primary.component';
import { BtnBorderThinComponent } from '../../../shared/components/btn-border-thin/btn-border-thin.component';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Course } from '../../models/course.interfaces';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../cart/state/cart.service';

@Component({
    selector: 'course-card',
    templateUrl: './course-card.component.html',
    styleUrl: './course-card.component.scss',
    imports: [BtnPrimaryComponent, BtnBorderThinComponent, CurrencyPipe, RouterModule, CommonModule, BtnBorderThinComponent],
})
export class CourseCardComponent {
  
  readonly course = input.required<Course>();
  
  cartService = inject(CartService);
  authService = inject(AuthService);

  constructor () { }
  

}
