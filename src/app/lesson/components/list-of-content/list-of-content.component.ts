import { Component, computed, inject, input } from '@angular/core';
import { ModulesAccordionComponent } from "../modules-accordion/modules-accordion.component";
import { rxResource } from '@angular/core/rxjs-interop';
import { ModuleService } from 'src/app/module/services/module.service';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-list-of-content',
  templateUrl: './list-of-content.component.html',
  styleUrl: './list-of-content.component.scss',
  imports: [ModulesAccordionComponent],
})
export class ListOfContentComponent {

  private moduleService = inject(ModuleService);
  private authService = inject(AuthService);

  // Reemplazar el isClickable directamente por un output con un EventEmmiter que se encargue de declararlo el componene padre que lo utilicé
  // en el caso de que sea de la ruta /course/id seria 
  isClickable = input<boolean>(false);
  courseId = input.required<string>();
  user = computed( () => this.authService.user() );

  modulesResource = rxResource({
    loader : ( ) => {
      return this.moduleService.getModulesByCourseId( this.courseId() );
    },
  });

  constructor( ) { }

}
