import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { Course } from '../course-list/Course';
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
    if( clickedContainer.classList.contains('overlay') ){
      this.isCartOpen = false;
    }

  }

  onUpQuantity = ( ) : void => {
    
  }

}
