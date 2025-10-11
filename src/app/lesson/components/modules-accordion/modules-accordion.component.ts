import { LessonPopulated } from './../../models/lesson.interfaces';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-modules-accordion',
  imports: [],
  templateUrl: './modules-accordion.component.html',
  styleUrl: './modules-accordion.component.scss'
})
export class ModulesAccordionComponent {

  unit = input.required<number>();
  lessons = input.required<LessonPopulated[]>();

}
