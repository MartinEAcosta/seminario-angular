import { Component, inject, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { ModulePopulated } from '@module/models/module.interfaces';
import { Router } from '@angular/router';
import { EnrollmentState } from '@enrollment/state/enrollment-state';

@Component({
  selector: 'app-modules-accordion',
  imports: [NgClass],
  templateUrl: './modules-accordion.component.html',
  styleUrl: './modules-accordion.component.scss'
})
export class ModulesAccordionComponent {
  
  router = inject(Router);

  enrollmentState = inject(EnrollmentState);

  isClickable = input<boolean>(false);
  isDeployed = signal<boolean>(false);
  module = input.required<ModulePopulated>();

  constructor( ) { }

  public toggleIsDeployed = ( ) => {
    return this.isDeployed.set( !this.isDeployed() );
  }

  public goToLesson = ( id_lesson : string ) => {
    const enrollmentId = this.enrollmentState.selectedEnrollment()?.id;
    if( this.isClickable() && enrollmentId ){
      this.router.navigateByUrl( `/enrollment/${ enrollmentId }/lesson/${ id_lesson }`);
    }
  }

}
