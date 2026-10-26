import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AuthService } from '@auth/services/auth.service';
import { TeacherRequest } from '@teacher-request/models/teacher-request.interfaces';

@Component({
    selector: 'app-teacher-request-status',
    templateUrl: './teacher-request-status.component.html',
    styleUrl: './teacher-request-status.component.scss',
    imports: [DatePipe]
})
export class TeacherRequestStatusComponent {

  private authService = inject(AuthService);

  public request = input.required<TeacherRequest>();
  public retry = output<void>();

  public onUpdateSession = ( ) : void => {
    this.authService.checkStatusResource.reload();
  }

}