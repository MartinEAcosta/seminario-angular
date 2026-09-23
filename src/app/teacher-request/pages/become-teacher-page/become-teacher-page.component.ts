/*
    Path:PORT/become-teacher
*/
import { Component, inject, signal } from '@angular/core';

import { UserState } from '@user/state/user-state';
import { EmailVerificationBannerComponent } from '@auth/components/email-verification-banner/email-verification-banner.component';
import { TeacherRequestState } from '@teacher-request/state/teacher-request-state';
import { TeacherRequestFormComponent } from '@teacher-request/components/teacher-request-form/teacher-request-form.component';
import { TeacherRequestDTO } from '@teacher-request/models/teacher-request.interfaces';

@Component({
    selector: 'app-become-teacher-page',
    templateUrl: './become-teacher-page.component.html',
    styleUrl: './become-teacher-page.component.scss',
    imports: [
        EmailVerificationBannerComponent,
        TeacherRequestFormComponent,
    ]
})
export class BecomeTeacherPageComponent {

  public userState = inject(UserState);
  public teacherRequestState = inject(TeacherRequestState);

  public user = this.userState.user;

  // Controla si se muestra el formulario (primera solicitud o re-postulación tras un rechazo).
  public showForm = signal<boolean>(false);

  onStartRequest = ( ) : void => {
    this.showForm.set(true);
  }

  onSubmitRequest = ( teacherRequestDTO : TeacherRequestDTO ) : void => {
    // this.teacherRequestState.submitRequest( teacherRequestDTO )
    //                          .subscribe( ( request ) => {
    //                            if( request ){
    //                              this.showForm.set(false);
    //                              this.uiService.showToastMessage('¡Tu solicitud fue enviada! Te vamos a avisar cuando sea revisada.');
    //                            }
    //                          });
  }

}
