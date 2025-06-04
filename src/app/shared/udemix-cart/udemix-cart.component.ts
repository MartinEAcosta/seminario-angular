import { Component, inject, OnInit, Signal } from '@angular/core';
import { CartService } from '../../services/cart/cart.service';
import { Course } from '../../interfaces/course.interfaces';
@Component({
  selector: 'app-udemix-cart',
  standalone: false,
  templateUrl: './udemix-cart.component.html',
  styleUrl: './udemix-cart.component.scss'
})
export class UdemixCartComponent implements OnInit {

  
  isCartOpen : boolean = false;
  cartItems !: Signal<Map<Course,number>>;

  private cartService = inject(CartService);

  constructor( ) {

    this.cartItems = this.cartService.getItemsOfCart();

  }

  ngOnInit(): void {
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
    const reservedQuantity = this.cartItems().get(course)
    // Si la cantidad reservada no es undefined y la capacidad no esta definida, es decir que no hay cupo limitado.
    // o en caso de estar la capacidad reservada por debajo del cupo dejar añadir al carro.
    if (
      reservedQuantity != undefined &&
      (course.capacity === undefined || reservedQuantity < course.capacity)
    ) {
      this.cartItems().set(course, reservedQuantity + 1);
    }
  }

  onDownQuantity = ( course : Course ) : void => {
    const reservedQuantity = this.cartItems().get(course);
    if( reservedQuantity != undefined && reservedQuantity > 0 && (course.capacity === undefined || course.capacity > 0)  ){
      this.cartItems().set( course , reservedQuantity - 1 );
    }
  }

}
