import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { AuthService } from '@auth/services/auth.service';
import { EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';
import { EnrollmentService } from '@enrollment/services/enrollment.service';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentState {

  private authService = inject(AuthService);
  private _enrollmentList = signal<EnrollmentDetailed[] | null>(null);
  private _selectedEnrollment = signal<EnrollmentDetailed | null>(null);

  enrollmentList = this._enrollmentList.asReadonly();
  selectedEnrollment = this._selectedEnrollment.asReadonly();
  user = computed(() => this.authService.user());

  constructor( private enrollmentService : EnrollmentService ) { }

  obtainEnrollmentList = ( ) : Observable<EnrollmentDetailed[]> => {
    if( !this.user() ) return of([]);
    if( this.enrollmentList() ) { 
      return of( this.enrollmentList()! );
    }
    return this.enrollmentService.getEnrollmentsByUserId( this.user()!.id ).pipe( 
      tap( (enrollments) => {
        this._enrollmentList.set( enrollments );
      })
    );
  }

  obtainEnrollment = ( id_enrollment : string ) : Observable<EnrollmentDetailed> => {
    if( !this.user() ) return of();
    if( this.selectedEnrollment() ){
      return of( this.selectedEnrollment()! );
    }
    return this.enrollmentService.getEnrollmentPopulatedById( id_enrollment ).pipe(
      tap( (enrollment) => {
        this._selectedEnrollment.set( enrollment );
      })
    );
  }

}
