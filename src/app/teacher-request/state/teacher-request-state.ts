import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { defer, EMPTY, Observable, tap } from 'rxjs';

import { TeacherRequestService } from '@teacher-request/services/teacher-request.service';
import { TeacherRequest, TeacherRequestDTO } from '@teacher-request/models/teacher-request.model';

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

  public isSubmitting = signal<boolean>( false );

  // desenlaces y recargar la solicitud solo en el éxito.
  //
  // El `defer` + la guarda de `isSubmitting` importan porque el observable es
  // frío: sin eso, el flag subiría al llamar (aunque nadie se suscriba) y dos
  // suscripciones mandarían dos solicitudes. Así el POST sale una sola vez.
  public submitRequest = ( teacherRequestDTO : TeacherRequestDTO ) : Observable<TeacherRequest> => {
    return defer( () => {
      if( this.isSubmitting() ) return EMPTY;

      this.isSubmitting.set( true );
      return this.teacherRequestService.createTeacherRequest( teacherRequestDTO )
                                  .pipe(
                                    tap({
                                      next  : () => {
                                        this.isSubmitting.set( false );
                                        this.myRequestResource.reload();
                                      },
                                      error : () => this.isSubmitting.set( false ),
                                    }),
                                  );
    });
  }

}
