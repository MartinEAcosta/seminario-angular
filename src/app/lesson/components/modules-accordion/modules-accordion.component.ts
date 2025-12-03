import { Component, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from "@angular/router";

import { ModulePopulated } from '@module/models/module.interfaces';

@Component({
  selector: 'app-modules-accordion',
  imports: [NgClass, RouterLink],
  templateUrl: './modules-accordion.component.html',
  styleUrl: './modules-accordion.component.scss'
})
export class ModulesAccordionComponent {
  
  isDeployed = signal<boolean>(false);
  isClickable = input<boolean>(false);
  module = input.required<ModulePopulated>();

  constructor( ) { }

  public toggleIsDeployed = ( ) => {
    return this.isDeployed.set( !this.isDeployed() );
  }

}
