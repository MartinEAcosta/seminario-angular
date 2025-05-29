import { Injectable } from '@angular/core';
import { Course } from '../course-list/Course';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private _courses : Map<Course,number> = new Map<Course,number>;
  private _itemsSubject : BehaviorSubject<Map<Course,number>> = new BehaviorSubject(this._courses);
  public courses : Observable<Map<Course,number>> = this._itemsSubject.asObservable();
  
  onAddToCart = ( course : Course ) : Map<Course,number>  => {
    const hasItem : boolean = this._courses.has( course )
    console.log(hasItem)
    if( hasItem ){
      let quantity : number = this._courses.get( course ) ?? 0;
      if( quantity < course.capacity ){
        this._courses.set( course, quantity+1 )
        return this._courses;
      }
      return this._courses;
    }
    this._courses.set( course, 1 );

    this._itemsSubject.next(this._courses);
    
    return this._courses;
  }

  getItemsOfCart = ( ) : Map<Course, number> => {
    return new Map<Course,number>(this._courses);
  }

  

}
