import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LibraryItem } from '@enrollment/utils/library-item.util';

@Component({
  selector: 'app-library-course-card',
  imports: [RouterLink],
  templateUrl: './library-course-card.component.html',
  styleUrl: './library-course-card.component.scss'
})
export class LibraryCourseCardComponent {

  item = input.required<LibraryItem>();

  enrollment = computed( () => this.item().enrollment );
  isCompleted = computed( () => this.item().status === 'completed' );
  isNotStarted = computed( () => this.item().status === 'not-started' );

  metaText = computed( () => {
    const { status, totalLessons, nextLessonNumber } = this.item();
    if ( status === 'in-progress' ) return `Lección ${ nextLessonNumber } de ${ totalLessons }`;
    if ( status === 'completed' ) return `${ totalLessons } lecciones · Terminado`;
    return `${ totalLessons } lecciones · Todavía no empezaste`;
  });

  footerLabel = computed( () => this.isNotStarted() ? 'Sin empezar' : `${ this.enrollment().progress }%` );

  buttonLabel = computed( () => {
    const { status } = this.item();
    if ( status === 'completed' ) return 'Repasar';
    if ( status === 'not-started' ) return 'Empezar';
    return 'Continuar';
  });

}
