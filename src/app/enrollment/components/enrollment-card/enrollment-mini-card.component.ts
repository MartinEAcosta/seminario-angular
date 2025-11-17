import { Component, input } from '@angular/core';
import { EnrollmentDetailed } from '../../models/enrollment.interfaces';
import { DatePipe } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-enrollment-mini-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './enrollment-mini-card.component.html',
  styleUrls: [ '../../../shared/styles/mini-card-component.scss' ,'./enrollment-mini-card.component.scss']
})
export class EnrollmentMiniCardComponent {

  enrollment = input.required<EnrollmentDetailed>();

  constructor() { 
    
  }

  ngAfterViewInit(){
    setTimeout( () =>
      console.log(this.enrollment().course.id_course)
      , 1
    );
  }


}
