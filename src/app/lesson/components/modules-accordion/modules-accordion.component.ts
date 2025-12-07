import { Component, inject, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { ModulePopulated } from '@module/models/module.interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modules-accordion',
  imports: [NgClass],
  templateUrl: './modules-accordion.component.html',
  styleUrl: './modules-accordion.component.scss'
})
export class ModulesAccordionComponent {
  
  router = inject(Router);

  isClickable = input<boolean>(false);
  isDeployed = signal<boolean>(false);
  module = input.required<ModulePopulated>();
  courseId = input.required<string>();

  constructor( ) { }

  public toggleIsDeployed = ( ) => {
    return this.isDeployed.set( !this.isDeployed() );
  }

  public goToLesson = ( id_lesson : string ) => {
    if( this.isClickable() ){
      this.router.navigateByUrl( `/course/${ this.courseId() }/take/lesson/${ id_lesson }`);
    }
  }

}
