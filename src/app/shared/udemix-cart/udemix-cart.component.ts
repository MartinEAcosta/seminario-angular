import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Course } from '../../components/course-list/Course';
@Component({
  selector: 'app-udemix-cart',
  standalone: false,
  templateUrl: './udemix-cart.component.html',
  styleUrl: './udemix-cart.component.scss'
})
export class UdemixCartComponent implements OnInit {

  
  isCartOpen : boolean = false;
  cartItems !: Map<Course, number>;

  constructor(private cartService : CartService ) {}

  ngOnInit(): void {
    this.cartService.courses.subscribe(data => {
      this.cartItems = data;
    })
  }
  
  onOpenCart = ( ) : void => {
    if( this.isCartOpen ) {
      return;
    }
    this.isCartOpen = !this.isCartOpen;

  }

  onCloseCart = ( ) : void => {
    const clickedContainer = event?.target as HTMLElement;
    if( clickedContainer.classList.contains('overlay') || clickedContainer.classList.contains('btn-continue') ){
      this.isCartOpen = false;
    }

  }

  onUpQuantity = ( course : Course ) : void => {
    const reservedQuantity = this.cartItems.get(course)
    if( reservedQuantity != undefined && reservedQuantity < course.capacity ){
      
      this.cartItems.set( course , reservedQuantity + 1 )
    }
  }

  onDownQuantity = ( course : Course ) : void => {
    const reservedQuantity = this.cartItems.get(course);
    if( reservedQuantity != undefined && reservedQuantity > 0 && course.capacity > 0 ){
      this.cartItems.set( course , reservedQuantity - 1 );
    }
  }

}
