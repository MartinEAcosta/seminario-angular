/*
    Path:PORT/become-teacher
*/
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { UserState } from '@user/state/user-state';
import { UIService } from '@shared/services/ui/ui.service';
import { EmailVerificationBannerComponent } from '@auth/components/email-verification-banner/email-verification-banner.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { TeacherRequestState } from '@teacher-request/state/teacher-request-state';
import { TeacherRequestFormComponent } from '@teacher-request/components/teacher-request-form/teacher-request-form.component';
import { TeacherRequestStatusComponent } from '@teacher-request/components/teacher-request-status/teacher-request-status.component';
import { TeacherRequestDTO } from '@teacher-request/models/teacher-request.interface';

@Component({
    selector: 'app-become-teacher-page',
    templateUrl: './become-teacher-page.component.html',
    styleUrl: './become-teacher-page.component.scss',
    imports: [
        RouterLink,
        EmailVerificationBannerComponent,
        LoaderComponent,
        TeacherRequestFormComponent,
        TeacherRequestStatusComponent,
    ]
})
export class BecomeTeacherPageComponent {

  private uiService = inject(UIService);
  private destroyRef = inject(DestroyRef);

  public userState = inject(UserState);
  public teacherRequestState = inject(TeacherRequestState);

  public user = this.userState.user;
  public myRequest = this.teacherRequestState.myRequest;
  public isLoading = this.teacherRequestState.isLoading;

  // Sólo relevante para 'rejected': permite reabrir el formulario vacío para volver a solicitar.
  public retryForm = signal<boolean>(false);

  public roadmapSteps = [
    { title : 'Enviás la solicitud', text : 'Contanos sobre vos y tu primer curso.' },
    { title : 'La revisamos', text : 'Te avisamos por correo con la respuesta.' },
    { title : 'Se habilita tu rol de profesor', text : 'Accedés al panel para crear cursos.' },
    { title : 'Creás tu primer curso', text : 'Módulos, lecciones y material.' },
  ];

  public currentStep = computed<number>( () => {
    switch( this.myRequest()?.status ){
      case 'pending'  : return 2;
      case 'approved' : return 3;
      default         : return 1;
    }
  });

  public onRetry = ( ) : void => {
    this.retryForm.set(true);
  }

  // TeacherRequestService no es auth: no ramifica por status y su error va al
  // toast. El copy es fijo del front — leer el body del error es trabajo
  // exclusivo de getAuthErrorMessage (ver SPEC 16).
  public onSubmitRequest = ( teacherRequestDTO : TeacherRequestDTO ) : void => {
    this.teacherRequestState.submitRequest( teacherRequestDTO )
                              // Si el usuario navega con el POST en vuelo, el toast
                              // aparecería en otra pantalla sin contexto.
                              .pipe( takeUntilDestroyed( this.destroyRef ) )
                              .subscribe({
                                next  : () => this.uiService.showToastMessage('Recibimos tu solicitud. Te avisamos por correo.'),
                                error : () => this.uiService.showToastMessage('No pudimos enviar tu solicitud, intentá nuevamente.'),
                              });
  }

}
