import { Component, input } from '@angular/core';
import { Enrollment } from '../../models/enrollment.interfaces';

@Component({
  selector: 'app-enrollment-card',
  imports: [],
  templateUrl: './enrollment-card.component.html',
  styleUrl: './enrollment-card.component.scss'
})
export class EnrollmentCardComponent {

  enrollment = input.required<Enrollment>();

  constructor() { }


}
