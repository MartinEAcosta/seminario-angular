import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LibraryCourseCardComponent } from "@enrollment/components/library-course-card/library-course-card.component";
import { PageTitleComponent } from "@shared/components/page-title/page-title.component";
import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { getEnrollmentStatus, toLibraryItem } from '@enrollment/utils/library-item.util';

type FilterKey = 'all' | 'in-progress' | 'not-started' | 'completed';

@Component({
  selector: 'app-enrollments-page',
  templateUrl: './enrollments-page.html',
  styleUrl: './enrollments-page.scss',
  imports: [LibraryCourseCardComponent, PageTitleComponent, LoaderComponent, RouterLink]
})
export default class EnrollmentsPage {

  private enrollmentState = inject(EnrollmentState);
  userEnrollments = this.enrollmentState.enrollmentList;
  isLoading = this.enrollmentState.isLoadingList;
  error = this.enrollmentState.listError;

  selectedFilter = signal<FilterKey>('all');

  libraryItems = computed( () => this.userEnrollments().map( toLibraryItem ) );

  // El hero "Seguí donde lo dejaste" destaca la inscripción en curso que se
  // tocó más recientemente, no la última comprada.
  heroEnrollment = computed( () => {
    const inProgress = this.userEnrollments().filter( e => getEnrollmentStatus( e.progress ) === 'in-progress' );
    if ( inProgress.length === 0 ) return null;

    return inProgress.reduce( ( latest, current ) =>
      new Date( current.last_accessed_at ) > new Date( latest.last_accessed_at ) ? current : latest
    );
  });

  heroItem = computed( () => {
    const enrollment = this.heroEnrollment();
    return enrollment ? toLibraryItem( enrollment ) : null;
  });

  countAll = computed( () => this.libraryItems().length );
  countInProgress = computed( () => this.libraryItems().filter( i => i.status === 'in-progress' ).length );
  countNotStarted = computed( () => this.libraryItems().filter( i => i.status === 'not-started' ).length );
  countCompleted = computed( () => this.libraryItems().filter( i => i.status === 'completed' ).length );

  filteredItems = computed( () => {
    const filter = this.selectedFilter();
    if ( filter === 'all' ) return this.libraryItems();
    return this.libraryItems().filter( item => item.status === filter );
  });

  setFilter ( filter : FilterKey ) : void {
    this.selectedFilter.set( filter );
  }

  onFilterSelectChange ( event : Event ) : void {
    this.setFilter( ( event.target as HTMLSelectElement ).value as FilterKey );
  }

  constructor() { }

}
