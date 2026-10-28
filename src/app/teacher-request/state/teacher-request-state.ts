import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { TeacherRequestService } from '@teacher-request/services/teacher-request.service';
import { TeacherRequestDTO } from '@teacher-request/models/teacher-request.interfaces';

@Injectable({
  providedIn: 'root',
})
export class TeacherRequestState {

  private teacherRequestService = inject(TeacherRequestService);

  // Última solicitud del usuario logueado, o null si todavía no solicitó nada.
  public myRequestResource = rxResource({
    stream : () => this.teacherRequestService.getMyTeacherRequest()
  });

  public myRequest = computed( () => this.myRequestResource.value() ?? null );
  public isLoading = computed( () => this.myRequestResource.isLoading() );

  // POST en curso: el form lo usa para deshabilitar "Enviar solicitud" y
  // evitar un doble envío si el usuario hace doble click durante el request.
  public isSubmitting = signal<boolean>( false );

  public submitRequest = ( teacherRequestDTO : TeacherRequestDTO ) : void => {
    this.isSubmitting.set( true );
    this.teacherRequestService.createTeacherRequest( teacherRequestDTO )
                                .subscribe( ( result ) => {
                                  this.isSubmitting.set( false );
                                  if( result ) this.myRequestResource.reload();
                                });
  }

}
