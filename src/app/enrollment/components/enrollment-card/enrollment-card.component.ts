import { Component, input } from '@angular/core';
import { EnrollmentDetailed } from '../../models/enrollment.interfaces';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-enrollment-card',
  imports: [ DatePipe ],
  templateUrl: './enrollment-card.component.html',
  styleUrl: './enrollment-card.component.scss'
})
export class EnrollmentCardComponent {

  enrollment = input.required<EnrollmentDetailed>();

  constructor() { }


}
