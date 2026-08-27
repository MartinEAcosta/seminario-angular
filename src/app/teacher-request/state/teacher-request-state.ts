import { computed, inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { State } from '@shared/state/state';
import { TeacherRequestService } from '@teacher-request/services/teacher-request.service';
import { TeacherRequest, TeacherRequestDTO } from '@teacher-request/models/teacher-request.interfaces';

interface TeacherRequestStateProps {
  myRequest : TeacherRequest | null;
}

@Injectable({
  providedIn: 'root',
})
export class TeacherRequestState extends State<TeacherRequestStateProps> {

  private teacherRequestService = inject(TeacherRequestService);

  myRequest = computed( () => this.state().data?.myRequest ?? null );

  constructor() {
    super();
  }

  loadMyRequest ( ) : Observable<TeacherRequest | null> {
    this.setIsLoading(true);

    return this.teacherRequestService.getMyTeacherRequest()
                                      .pipe(
                                        tap( ( request ) => {
                                          this.state.update( ( c ) =>
                                            ({
                                              ...c,
                                              data : { myRequest : request },
                                            }),
                                          );
                                          this.setIsLoading(false);
                                        }),
                                      );
  }

  submitRequest ( teacherRequestDTO : TeacherRequestDTO ) : Observable<TeacherRequest | false> {
    this.setIsLoading(true);

    return this.teacherRequestService.createTeacherRequest( teacherRequestDTO )
                                      .pipe(
                                        tap( ( request ) => {
                                          this.setIsLoading(false);
                                          if( request ){
                                            this.state.update( ( c ) =>
                                              ({
                                                ...c,
                                                data : { myRequest : request },
                                              }),
                                            );
                                          }
                                        }),
                                      );
  }

}
