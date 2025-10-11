import { Component, input, signal } from '@angular/core';
import { LessonPopulated } from '../../models/lesson.interfaces';
import { ModulesAccordionComponent } from "../modules-accordion/modules-accordion.component";

@Component({
  selector: 'app-list-of-lessons',
  templateUrl: './list-of-lessons.component.html',
  styleUrl: './list-of-lessons.component.scss',
  imports: [ModulesAccordionComponent]
})
export class ListOfLessonsComponent {

  lessons = input.required<LessonPopulated[]>();

  modules = signal<Map<number,LessonPopulated[]>>( new Map<number,LessonPopulated[]>() );
 
  constructor( ) {
    let auxArray = this.modules();
    for( let lesson of this.lessons() ){
      if( this.modules()?.has( lesson.unit ) ) {
        auxArray.get( lesson.unit )?.push( lesson );
      }
      else{
        auxArray.set( lesson.unit , [lesson] );
      }
    }
    this.modules.set(auxArray);
  }

  get modulesArray() {
  return Array.from(this.modules().entries()).map(([unit, lessons]) => ({
    unit,
    lessons,
  }));
}
}
