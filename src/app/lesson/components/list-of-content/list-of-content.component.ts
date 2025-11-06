import { Component, inject, input, signal } from '@angular/core';
import { ModulesAccordionComponent } from "../modules-accordion/modules-accordion.component";
import { rxResource } from '@angular/core/rxjs-interop';
import { ModuleService } from 'src/app/module/services/module.service';
import { UserState } from '@auth/state/user-state';

@Component({
  selector: 'app-list-of-content',
  templateUrl: './list-of-content.component.html',
  styleUrl: './list-of-content.component.scss',
  imports: [ModulesAccordionComponent],
})
export class ListOfContentComponent {

  private moduleService = inject(ModuleService);
  private userState = inject(UserState);
  courseId = input.required<string>();
  user = this.userState.user();

  modulesResource = rxResource({
    loader : ( ) => {
      return this.moduleService.getModulesByCourseId( this.courseId() );
    },
  });

  constructor( ) { }
  
  

}
