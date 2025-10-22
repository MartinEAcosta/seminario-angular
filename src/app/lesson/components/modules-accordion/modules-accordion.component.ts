import { Module } from 'src/app/module/models/module.interfaces';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-modules-accordion',
  imports: [],
  templateUrl: './modules-accordion.component.html',
  styleUrl: './modules-accordion.component.scss'
})
export class ModulesAccordionComponent {

  module = input.required<Module>();

}
