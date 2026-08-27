import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TeacherRequest } from '@teacher-request/models/teacher-request.interfaces';

@Component({
    selector: 'app-teacher-request-status',
    templateUrl: './teacher-request-status.component.html',
    styleUrl: './teacher-request-status.component.scss',
    imports: [DatePipe]
})
export class TeacherRequestStatusComponent {

  public request = input.required<TeacherRequest>();

}
