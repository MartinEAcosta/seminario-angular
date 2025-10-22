import { Component, inject, input, signal } from '@angular/core';
import { ModulesAccordionComponent } from "../modules-accordion/modules-accordion.component";
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { ModuleService } from 'src/app/module/services/module.service';

@Component({
  selector: 'app-list-of-content',
  templateUrl: './list-of-content.component.html',
  styleUrl: './list-of-content.component.scss',
  imports: [ModulesAccordionComponent],
})
export class ListOfContentComponent {

  private moduleService = inject(ModuleService);

  courseId = input.required<string>();

  modulesResource = rxResource({
    loader : ( ) => {
      return this.moduleService.getModulesByCourseId( this.courseId() );
    },
  });
 
  constructor( ) {
  }


}
