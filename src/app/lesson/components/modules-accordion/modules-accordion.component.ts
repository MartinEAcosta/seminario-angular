import { Module, ModulePopulated } from 'src/app/module/models/module.interfaces';
import { Component, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-modules-accordion',
  imports: [NgClass],
  templateUrl: './modules-accordion.component.html',
  styleUrl: './modules-accordion.component.scss'
})
export class ModulesAccordionComponent {

  isDeployed = signal<boolean>(false);

  module = input.required<ModulePopulated>();


  constructor( ) { }

  public toggleIsDeployed = ( ) => {
    return this.isDeployed.set( !this.isDeployed() );
  }

}
