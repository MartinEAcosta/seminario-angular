import { Injectable } from '@angular/core';
import { Course } from './course-list/Course';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private courses : Map<Course,number> = new Map<Course,number>;
  
  onAddToCart = ( course : Course ) : void => {
    const hasItem : boolean = this.courses.has( course )
    if( hasItem ){
      let quantity : number = this.courses.get( course ) ?? 0;
      this.courses.set( course, quantity++ )
    }
    this.courses.set( course, 1 );
  }

  

}
