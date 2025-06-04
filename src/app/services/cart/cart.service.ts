import { computed, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Course } from '../../interfaces/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private _courses : WritableSignal<Map<Course,number>> = signal(new Map<Course,number>);
  readonly courses = computed(() => this._courses());
  
  onAddToCart = ( course : Course ) : WritableSignal<Map<Course,number>>  => {
    const hasItem : boolean = this._courses().has( course );
    console.log(hasItem)
    if( hasItem ){
      let quantity : number = this._courses().get( course ) ?? 0;
      if( course.capacity === undefined || quantity < course.capacity ){
        this._courses().set( course, quantity+1 )
      }
      return this._courses;
    }

    this._courses.set( this._courses().set(course,1)  );
    return this._courses;
  }

  getItemsOfCart = ( ) : Signal<Map<Course, number>> => {
    return this.courses;
  }

  

}
