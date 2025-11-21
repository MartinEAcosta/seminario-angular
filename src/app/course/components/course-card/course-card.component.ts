import { Component, inject, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { BtnPrimaryComponent } from '../../../shared/components/btns/btn-primary/btn-primary.component';
import { BtnBorderThinComponent } from '../../../shared/components/btns/btn-border-thin/btn-border-thin.component';
import { Course } from '../../models/course.interfaces';
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
