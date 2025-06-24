import { ChangeDetectionStrategy, Component, inject, input , InputSignal, output } from '@angular/core';

import { AuthService } from '../../services/auth/auth.service';
import { BtnPrimaryComponent } from '../../shared/components/btn-primary/btn-primary.component';
import { BtnAddToCartComponent } from '../../shared/components/btn-add-to-cart/btn-add-to-cart.component';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Course } from '../../interfaces/course.interfaces';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { Cart } from '../../interfaces/cart.interface';

@Component({
    selector: 'app-course-list',
    templateUrl: './course-list.component.html',
    styleUrl: './course-list.component.scss',
    imports: [BtnPrimaryComponent, BtnAddToCartComponent, CurrencyPipe, RouterModule, CommonModule],
})
export class CourseListComponent {
  
  readonly courses = input.required<Course[]>();
  
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
