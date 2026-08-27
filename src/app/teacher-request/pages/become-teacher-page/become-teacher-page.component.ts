/*
    Path:PORT/become-teacher
*/
import { Component, inject, OnInit, signal } from '@angular/core';

import { AuthService } from '@auth/services/auth.service';
import { UIService } from '@shared/services/ui/ui.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { EmailVerificationBannerComponent } from '@auth/components/email-verification-banner/email-verification-banner.component';
import { TeacherRequestState } from '@teacher-request/state/teacher-request-state';
import { TeacherRequestFormComponent } from '@teacher-request/components/teacher-request-form/teacher-request-form.component';
import { TeacherRequestStatusComponent } from '@teacher-request/components/teacher-request-status/teacher-request-status.component';
import { TeacherRequestDTO } from '@teacher-request/models/teacher-request.interfaces';

@Component({
    selector: 'app-become-teacher-page',
    templateUrl: './become-teacher-page.component.html',
    styleUrl: './become-teacher-page.component.scss',
    imports: [
        LoaderComponent,
        EmailVerificationBannerComponent,
        TeacherRequestFormComponent,
        TeacherRequestStatusComponent,
    ]
})
export class BecomeTeacherPageComponent implements OnInit {

  public authService = inject(AuthService);
  public teacherRequestState = inject(TeacherRequestState);
  private uiService = inject(UIService);

  public user = this.authService.user;
  public isLoading = this.teacherRequestState.isLoading;
  public myRequest = this.teacherRequestState.myRequest;

  // Controla si se muestra el formulario (primera solicitud o re-postulación tras un rechazo).
  public showForm = signal<boolean>(false);

  ngOnInit(): void {
    // Ya es profesor/admin, o el email todavía no fue validado: no hace falta consultar el estado de la solicitud.
    if( this.user()?.role !== 'student' || !this.user()?.isEmailVerified ) return;

    this.teacherRequestState.loadMyRequest().subscribe();
  }

  onStartRequest = ( ) : void => {
    this.showForm.set(true);
  }

  onSubmitRequest = ( teacherRequestDTO : TeacherRequestDTO ) : void => {
    this.teacherRequestState.submitRequest( teacherRequestDTO )
                             .subscribe( ( request ) => {
                               if( request ){
                                 this.showForm.set(false);
                                 this.uiService.showToastMessage('¡Tu solicitud fue enviada! Te vamos a avisar cuando sea revisada.');
                               }
                             });
  }

}
