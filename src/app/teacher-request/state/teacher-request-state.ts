import { computed, inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { TeacherRequestService } from '@teacher-request/services/teacher-request.service';
import { TeacherRequest, TeacherRequestDTO } from '@teacher-request/models/teacher-request.interfaces';

@Injectable({
  providedIn: 'root',
})
export class TeacherRequestState {

  private teacherRequestService = inject(TeacherRequestService);

}
