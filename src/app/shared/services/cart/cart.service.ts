import { effect, Injectable, signal } from '@angular/core';
import { Course } from '../../../course/interfaces/course.interfaces';
import { Cart } from '../../../course/interfaces/cart.interface';

// debido a que no necesita ninguna dependencia es posible definirla afuera.
const loadFromLocalStorage = ( ) : Cart => {
  const cart = localStorage.getItem( 'cart' );
  let localStorageObj;
  if( cart ){
    localStorageObj = JSON.parse(cart);

    return{
      ...localStorageObj,
      courses: new Map(localStorageObj.courses),
    }
  }
  return { courses: new Map<Course,number>() };
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // Pensado como un map en donde el Curso es la key y el number la quantity reservada por el usuario
  cart = signal<Cart>( loadFromLocalStorage() );
  
  saveToLocalStorage = effect( () => {
    const cartToSave = this.cart();
    // A la hora de parsear el Map lo convierte en un Array por lo tanto al consumirlo da error
    // Me encargo de pasarlo a un array de key value por entrada que habia en el map.
    const cartSerialized = {
      ...cartToSave,
      courses: Array.from(cartToSave.courses.entries()),
    }

    localStorage.setItem( 'cart' , JSON.stringify( cartSerialized ) );
  });

  onAddToCart = ( course : Course )  => {
    const currentCart = this.cart();
    const nextCart =  new Map(currentCart.courses);
    if( currentCart.courses.has(course) ){
      const quantityCourse = this.cart().courses.get(course)!;
      if( course.capacity === undefined || quantityCourse < course.capacity ){
        nextCart.set( course , quantityCourse+1 );
        this.cart.set({
          ...currentCart,
          courses: nextCart,
        });
      }
      // TODO: Manejar error
      return this.cart();
    }

    nextCart.set( course , 1 );
    this.cart.set({
      ...currentCart,
      courses: nextCart,
    });
    return this.cart();
  }

  onUpQuantity = ( course : Course ) : void => {
    const reservedQuantity = this.cart().courses.get(course);
    // Si la cantidad reservada no es undefined y la capacidad no esta definida, es decir que no hay cupo limitado.
    // o en caso de estar la capacidad reservada por debajo del cupo dejar añadir al carro.
    if ( reservedQuantity != undefined 
        &&
        ( course.capacity === undefined || reservedQuantity < course.capacity ) ) 
        {
          this.cart().courses.set(course, reservedQuantity + 1);
    }
  }

  onDownQuantity = ( course : Course ) : void => {
    const reservedQuantity = this.cart().courses.get(course);
    if( reservedQuantity != undefined && reservedQuantity > 0 && (course.capacity === undefined || course.capacity > 0)  ){
      this.cart().courses.set( course , reservedQuantity - 1 );
    }
  }

}
