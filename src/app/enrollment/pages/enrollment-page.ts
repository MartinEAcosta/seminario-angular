import { Component, inject } from '@angular/core';
import { of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { AuthService } from 'src/app/auth/services/auth.service';
import { EnrollmentService } from '../services/enrollment.service';
import { EnrollmentCardComponent } from "../components/enrollment-card/enrollment-card.component";

@Component({
  selector: 'app-enrollment-page',
  templateUrl: './enrollment-page.html',
  styleUrl: './enrollment-page.scss',
  imports: [EnrollmentCardComponent]
})
export default class EnrollmentsPage {

  private authService = inject(AuthService);
  private enrollmentService = inject(EnrollmentService);

  // * Resolver?
  public enrollmentResources = rxResource({
    request : () => { 
                      const id_user = this.authService.id();
                      return id_user ? { id_user } : null
                    },
    loader  : ({ request }) => { 
                                if( !request ) {
                                  // * Debes estar logueado para visualizar tus inscripciones
                                  return of([]);
                                }
                                return this.enrollmentService.getEnrollmentsByUserId( request.id_user );
                              }
  });

  constructor() { }

}
