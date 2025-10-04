import { Component, inject } from '@angular/core';
import { of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { AuthService } from 'src/app/auth/services/auth.service';
import { EnrollmentService } from '../services/enrollment.service';
import { EnrollmentMiniCardComponent } from "../components/enrollment-card/enrollment-mini-card.component";
import { SearchFilterBarComponent } from "src/app/shared/components/search-filter-bar/search-filter-bar.component";
import { LoaderComponent } from "src/app/shared/components/loader/loader.component";
import { PageTitleComponent } from "src/app/shared/components/page-title/page-title.component";

@Component({
  selector: 'app-enrollment-page',
  templateUrl: './enrollment-page.html',
  styleUrl: './enrollment-page.scss',
  imports: [EnrollmentMiniCardComponent, SearchFilterBarComponent, LoaderComponent, PageTitleComponent]
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
                                  return of(null);
                                }
                                return this.enrollmentService.getEnrollmentsByUserId( request.id_user );
                              }
  });

  constructor() { }

}
