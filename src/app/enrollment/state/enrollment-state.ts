import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, tap } from 'rxjs';

import { AuthService } from '@auth/services/auth.service';
import { EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';
import { EnrollmentService } from '@enrollment/services/enrollment.service';

interface EnrollmentStateData {
  isLoading : boolean,
  error : string | null,
  selectedEnrollment : EnrollmentDetailed | null,
  enrollmentList : EnrollmentDetailed[] | null,
};

@Injectable({
  providedIn: 'root'
})
export class EnrollmentState {

  private authService = inject(AuthService);
  private enrollmentService = inject(EnrollmentService);

  private state = signal<EnrollmentStateData>({
    isLoading : false,
    error : null,
    selectedEnrollment : null,
    enrollmentList : null,
  });

  enrollmentList = computed(() => this.state().enrollmentList);
  selectedEnrollment = computed(() => this.state().selectedEnrollment);
  user = computed(() => this.authService.user());

  constructor( ) {
    effect(() => {
      if (!this.user()) {
        this.resetState();
      }
    });
  }

  obtainEnrollmentList ( ) : Observable<EnrollmentDetailed[]> {
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
        throw error;
      }),
      finalize(() => this.setIsLoading(false))
    );
  }

  obtainEnrollment ( id_enrollment : string ) : Observable<EnrollmentDetailed> {
    if( !this.user() ) return of();
    
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
          throw error;
        }),
        finalize(() => this.setIsLoading(false))
      );
  }

  setIsLoading( bool : boolean ) {
    this.state.update( (c) => ({
        ...c ,
        isLoading : bool,
    }))
  }

  resetState ( ) : EnrollmentStateData {
    this.state.set( {
      isLoading : false,
      error : null,
      enrollmentList : null,
      selectedEnrollment : null,
    } );

    return this.state();
  }

  handleError ( error : any ) : EnrollmentStateData {
    const errorMessage = error.message || 'Ocurrio un error inesperado.';

    this.state.update( (c) => ({
      ...c , 
      error : errorMessage, 
      }) 
    );
    return this.state();
  }

}