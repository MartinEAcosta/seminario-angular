import { effect, Injectable, signal } from '@angular/core';
import { Course } from '../../../course/interfaces/course.interfaces';
import { CartItem } from '../../../course/interfaces/cart.interface';

// // debido a que no necesita ninguna dependencia es posible definirla afuera.
const loadFromLocalStorage = ( )  => {
  
  const cartFromLocalStorage = localStorage.getItem( 'cart' );

  if( cartFromLocalStorage ){
    const cartObj  = JSON.parse(cartFromLocalStorage);
    return cartObj;
  }
  
  return new Map();
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // Pensado como un map en donde el Curso es la key y el number la quantity reservada por el usuario
  cart = signal<Map<string,CartItem>>( loadFromLocalStorage() );
  
  saveToLocalStorage = effect( () => {
  //   // Se disparara la cuando cambien el carrito.
    const cartChanged = this.cart();

    const cartChangedSerialized  = JSON.stringify( cartChanged );

    localStorage.setItem( 'cart' , cartChangedSerialized );
  });

  onAddToCart = ( course : Course )  => {
    const _currentCart = this.cart();
    const currentCart = new Map<string, CartItem>( _currentCart );
    if( course.capacity != undefined && course.capacity <= 0 ) return;
    console.log(this.cart().get( course._id )?.quantity);
    // En caso de que ya tenga en mi carrito una cantidad del curso, tomo la cantidad reservada
    // o si no la tengo 0 y posteriormente se le sumara 1 
    const currentReserved = this.cart().get( course._id )?.quantity || 0;
    currentCart.set( course._id , 
      { 
        course : course ,
        quantity : (currentReserved+1)
      });
    // actualizo la señal
    this.cart.set(currentCart);
    return this.cart();
  }

  onUpQuantity = ( course : Course ) : void => {
    const reservedQuantity = this.cart().get( course._id )?.quantity || 1;
    // Si la cantidad reservada no es undefined y la capacidad no esta definida, es decir que no hay cupo limitado.
    // o en caso de estar la capacidad reservada por debajo del cupo dejar añadir al carro.
    if ( reservedQuantity != undefined 
        &&
        ( course.capacity === undefined || reservedQuantity < course.capacity ) ) 
        {
          this.cart().set( course._id , { course , quantity : reservedQuantity } );
    }
  }

  onDownQuantity = ( course : Course ) : void => {
    const reservedQuantity = this.cart().get(course._id)?.quantity || 1;
    if( reservedQuantity != undefined && reservedQuantity > 0 && (course.capacity === undefined || course.capacity > 0)  ){
      this.cart().set( course._id , { course , quantity : reservedQuantity } );
    }
  }

}
