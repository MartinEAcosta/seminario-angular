import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from "@angular/router";

import { EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';

@Component({
  selector: 'app-enrollment-mini-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './enrollment-mini-card.component.html',
  styleUrls: [ '../../../shared/styles/mini-card-component.scss' ,'./enrollment-mini-card.component.scss']
})
export class EnrollmentMiniCardComponent {

  enrollment = input.required<EnrollmentDetailed>();

  constructor() { }

}
