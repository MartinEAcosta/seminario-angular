import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, tap } from 'rxjs';

import { AuthService } from '@auth/services/auth.service';
import { EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';
import { EnrollmentService } from '@enrollment/services/enrollment.service';
import { State } from '@shared/state/state';

interface EnrollmentStateProps {
  selectedEnrollment : EnrollmentDetailed | null,
  enrollmentList : EnrollmentDetailed[] | null,
};

@Injectable({
  providedIn: 'root'
})
export class EnrollmentState extends State<EnrollmentStateProps> {

  private authService = inject(AuthService);
  private enrollmentService = inject(EnrollmentService);

  enrollmentList = computed(() => this.state().data?.enrollmentList);
  selectedEnrollment = computed(() => this.state().data?.selectedEnrollment);
  user = computed(() => this.authService.user());

  constructor( ) {
    super();
    effect(() => {
      if (!this.user()) {
        this.resetState();
      }
    });
  }

  loadEnrollmentList ( ) : Observable<EnrollmentDetailed[]> {
    if( !this.user() ) return of([]);

    if( this.enrollmentList() ) { 
      return of( this.enrollmentList()! );
    }

    this.setIsLoading(true);

    return this.enrollmentService.getEnrollmentsByUserId( this.user()!.id ).pipe( 
      tap( (enrollments) => {
        this.state.update( (c) => ({ ...c, enrollmentList : enrollments}));
      }),
      catchError( (error) => {
        this.handleError( error );
        return of([]);
      }),
      finalize(() => this.setIsLoading(false))
    );
  }

  loadEnrollment ( id_enrollment : string ) : Observable<EnrollmentDetailed | null> {
    if( !this.user() ) return of(null);
    
    if( this.selectedEnrollment() && (this.selectedEnrollment()?.id === id_enrollment)  ){
      return of( this.selectedEnrollment()! );
    }

    this.setIsLoading(true);

    return this.enrollmentService
      .getEnrollmentPopulatedById(id_enrollment)
      .pipe(
        tap((enrollment) => {
          this.state.update((c) => ({
            ...c,
            selectedEnrollment: enrollment,
            error: null,
          }));
        }),
        catchError((error) => {
          this.handleError(error);
          return of(null);
        }),
        finalize(() => this.setIsLoading(false))
      );
  }

}