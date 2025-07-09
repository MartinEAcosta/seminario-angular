import { computed, effect, Injectable, signal } from '@angular/core';
import { Course } from '../../../course/interfaces/course.interfaces';
import { CartItem } from '../../../course/interfaces/cart.interface';
import { throwError } from 'rxjs';

const CART_KEY = 'cart';

const loadFromLocalStorage = ( ) : Map<string,CartItem> => {
  const cartStrigify = localStorage.getItem( CART_KEY );

  try{

    if( cartStrigify ){
      const parsedCart  = JSON.parse( localStorage.getItem( CART_KEY )! );
      const loadedCart = new Map<string,CartItem>();
      for( let cartItem of parsedCart as CartItem[] ){
        loadedCart.set( cartItem.course.id , cartItem);
      }
      return loadedCart;
    }
  }
  catch(error) {
    console.log(error);
    throwError(() => new Error( "El carrito no sido posible de cargar, se retorno un carrito vació." ));
  }

  return new Map<string,CartItem>;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {

  // Pensado como un map en donde el Curso es la key y el number la quantity reservada por el usuario
  cart = signal<Map<string,CartItem> >( loadFromLocalStorage() );
  cartFromLocalStorage = computed ( () => this.cart() );

  saveToLocalStorage = effect( ( ) => {
    const cartArrayValues = Array.from( this.cartFromLocalStorage().values() )
    const cartSearilized = JSON.stringify( cartArrayValues );
    console.log(cartSearilized);
    localStorage.setItem( CART_KEY , cartSearilized );
  });

  onAddToCart = ( course : Course )  => {
    const currentCart = new Map<string, CartItem>( this.cart() );

    if( course.capacity != undefined && course.capacity <= 0 ) return;

    // En caso de que ya tenga en mi carrito una cantidad del curso, tomo la cantidad reservada
    // o si no la tengo 0 y posteriormente se le sumara 1 
    const currentReserved = this.cart().get( course.id )?.quantity || 0;

    currentCart.set( course.id , 
      { 
        course : course ,
        quantity : (currentReserved+1)
      }
    );

    // actualizo la señal
    this.cart.set( currentCart );
    
    return this.cart();
  }

  upQuantity = ( course : Course , currentReserved : number ) : Map<string,CartItem> => {
    const currentCart = new Map<string,CartItem>( this.cart() );
    
    // Modifico el mapa
    currentCart.set( course.id , 
                    {
                      course: course ,
                      quantity: currentReserved+1 
                    } 
                  );

    // actualizo la señal 
    this.cart.set( currentCart );

    return this.cart();
  }

  downQuantity = ( course : Course , currentReserved : number ) : Map<string,CartItem> => {
    const currentCart = new Map<string,CartItem>( this.cart() );

    // Modifico el mapa
    currentCart.set( course.id , 
                    {
                      course: course ,
                      quantity: currentReserved-1 
                    } 
                  );

    // actualizo la señal 
    this.cart.set( currentCart );

    return this.cart();
  }

}
