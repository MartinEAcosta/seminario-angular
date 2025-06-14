import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { CartService } from '../../../services/cart/cart.service';
import { Course } from '../../../interfaces/course.interfaces';
import { NgClass } from '@angular/common';
@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
    imports: [NgClass]
})
export class CartComponent implements OnInit {

  isCartOpen = signal<boolean>(false);
  cartItems !: Signal<Map<Course,number>>;

  private cartService = inject(CartService);

  constructor( ) {

    this.cartItems = this.cartService.getItemsOfCart();

  }

  ngOnInit(): void {
  }
  
  onOpenCart = ( ) : void => {
    if( this.isCartOpen() ) {
      return;
    }
    this.isCartOpen.set(!this.isCartOpen());

  }

  onCloseCart = ( ) : void => {
    const clickedContainer = event?.target as HTMLElement;
    if( clickedContainer.classList.contains('overlay') || clickedContainer.classList.contains('btn-continue') ){
      this.isCartOpen.set(false);
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
