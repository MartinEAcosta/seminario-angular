import { computed, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Course } from '../../interfaces/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // Pensado como un map en donde el Curso es la key y el number la quantity reservada por el usuario.
  private _courses : WritableSignal<Map<Course,number>> = signal(new Map<Course,number>);
  
  readonly courses = computed(() => this._courses());
  
  onAddToCart = ( course : Course ) : WritableSignal<Map<Course,number>>  => {
    const hasItem : boolean = this._courses().has( course );
    if( hasItem ){
      let quantity : number = this._courses().get( course ) ?? 0;
      if( course.capacity === undefined || quantity < course.capacity ){
        this._courses().set( course, quantity+1 );
      }
      return this._courses;
    }

    this._courses.set( this._courses().set(course,1) );
    return this._courses;
  }

  onUpQuantity = ( course : Course ) : void => {
    const reservedQuantity = this._courses().get(course);
    // Si la cantidad reservada no es undefined y la capacidad no esta definida, es decir que no hay cupo limitado.
    // o en caso de estar la capacidad reservada por debajo del cupo dejar añadir al carro.
    if ( reservedQuantity != undefined 
        &&
        ( course.capacity === undefined || reservedQuantity < course.capacity ) ) 
        {
          this._courses().set(course, reservedQuantity + 1);
    }
  }

  onDownQuantity = ( course : Course ) : void => {
    const reservedQuantity = this._courses().get(course);
    if( reservedQuantity != undefined && reservedQuantity > 0 && (course.capacity === undefined || course.capacity > 0)  ){
      this._courses().set( course , reservedQuantity - 1 );
    }
  }

}
