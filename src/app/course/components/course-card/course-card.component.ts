import { Component, inject, input , output } from '@angular/core';

import { AuthService } from '../../../auth/services/auth.service';
import { BtnPrimaryComponent } from '../../../shared/components/btn-primary/btn-primary.component';
import { BtnBorderThinComponent } from '../../../shared/components/btn-border-thin/btn-border-thin.component';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Course } from '../../interfaces/course.interfaces';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../shared/services/cart/cart.service';
import { Cart } from '../../interfaces/cart.interface';

@Component({
    selector: 'course-card',
    templateUrl: './course-card.component.html',
    styleUrl: './course-card.component.scss',
    imports: [BtnPrimaryComponent, BtnBorderThinComponent, CurrencyPipe, RouterModule, CommonModule, BtnBorderThinComponent],
})
export class CourseCardComponent {
  
  readonly course = input.required<Course>();
  
  newCart = output<Cart>();

  authService = inject(AuthService);
  cartService = inject(CartService);

  readonly user = this.authService.user();

  // ngOnInit(){
  //    setTimeout(() => console.log(this.courses()), 3000);
  // }

  onAddToCart = ( course : Course ) : Cart  => {
    if( course.capacity != undefined && course?.capacity! <= 0 ) return this.cartService.cart();
    
    this.cartService.onAddToCart( course );
    this.newCart.emit( this.cartService.cart()) ;
    return this.cartService.cart();
  }

}
