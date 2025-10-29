import { Router } from '@angular/router';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Course } from '../../course/models/course.interfaces';
import { map, throwError } from 'rxjs';
import { CartItem, ItemQuantity } from '../models/cart.interface';
import { Cart } from '../models/cart.model';
import { PaymentService } from 'src/app/payment/services/payment.service';

const CART_KEY = 'cart';

// La razón por la que devolvia el carrito vació es debido a que en el servicio de autenticación
// a la hora de chequear el status, en caso de que no se obtenga el token se llama la función de limpieza logout()
// que se encarga de realizar el clear del localStorage, esto con el fin de que no queden datos vinculados a la sesión
// aunque si se quiere se podria reemplazar el localStorage.clear() por el .removeItem('item').
const loadFromLocalStorage = ( ) : Cart => {
  const cartStrigify = localStorage.getItem( CART_KEY );
  try{

    if( cartStrigify ){
      const parsedCart  = JSON.parse( localStorage.getItem( CART_KEY )! );
      const loadedCart = new Map<string,CartItem>();
      for( let cartItem of parsedCart as CartItem[] ){
        loadedCart.set( cartItem.course.id , cartItem);
      }
      return new Cart(loadedCart);
    }
  }
  catch(error) {
    console.log(error);
    throwError(() => new Error( "El carrito no sido posible de cargar, se retorno un carrito vació." ));
  }

  return new Cart();
}

@Injectable({
  providedIn: 'root',
})
export class CartService {

  // Pensado como un map en donde el Curso es la key y el number la quantity reservada por el usuario
  public cart = signal<Cart>( loadFromLocalStorage() );
  public cartFromLocalStorage = computed ( () => this.cart() );
  public total = signal<number>( 0 );
  private paymentService = inject(PaymentService);

  constructor() { 
 
  }
  
  private saveToLocalStorage = effect( ( ) => {
    const cartArrayValues = Array.from( this.cartFromLocalStorage().items.values() )
    const cartSearilized = JSON.stringify( cartArrayValues );

    localStorage.setItem( CART_KEY , cartSearilized );
  });

  private obtainTotalOnChange = effect(() => {
      const items = this.getItemsArray();
      const code = this.cart().code;

      if (items.length === 0) {
        this.total.set(0);
        return;
      }

      this.paymentService
        .calculateTotal(items, code)
        .subscribe({
          next: total => this.total.set(total),
          error: err => console.error('Error calculando total:', err),
        });
  });

  public getItemsArray = () : ItemQuantity[] => {
    return Array.from(this.cart().items.values()).map(item => ({
      id_course: item.course.id,
      quantity: item.quantity
    }));
  }

  public onAddToCart = ( course : Course ) : Cart => {
    this.cart.set( new Cart( this.cart().addToCart( course ) , this.cart().code ) );
    return this.cart();
  }

  public upQuantity = ( course : Course ) : Cart => {
    this.cart.set( new Cart( this.cart().upQuantity( course ) , this.cart().code ) );
    return this.cart();
  }

  public downQuantity = ( course : Course ) : Cart => {
    this.cart.set( new Cart(this.cart().downQuantity( course )) );
    return this.cart();
  }

  public calculateTotal = ( ) : number => {
    this.paymentService.calculateTotal( this.getItemsArray() , this.cart().code ).subscribe( value => { this.total.set(value) });
    return this.total();
  }
  

}
