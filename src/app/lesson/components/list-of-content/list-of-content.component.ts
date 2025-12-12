import { Component, computed, inject, input } from '@angular/core';
import { ModulesAccordionComponent } from "../modules-accordion/modules-accordion.component";
import { rxResource } from '@angular/core/rxjs-interop';
import { ModuleService } from 'src/app/module/services/module.service';
import { AuthService } from '@auth/services/auth.service';
import { LoaderComponent } from "@shared/components/loader/loader.component";

@Component({
  selector: 'app-list-of-content',
  templateUrl: './list-of-content.component.html',
  styleUrl: './list-of-content.component.scss',
  imports: [ModulesAccordionComponent, LoaderComponent],
})
export class ListOfContentComponent {

  private moduleService = inject(ModuleService);
  private authService = inject(AuthService);

  courseId = input.required<string>();
  user = computed( () => this.authService.user() );

  modulesResource = rxResource({
    loader : ( ) => {
      return this.moduleService.getModulesByCourseId( this.courseId() );
    },
  });

  constructor( ) {  }

}
