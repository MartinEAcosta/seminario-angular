import { Component, computed, inject, input } from '@angular/core';
import { ModulesAccordionComponent } from "../modules-accordion/modules-accordion.component";
import { UserState } from '@user/state/user-state';
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { ModulePopulated } from '@module/models/module.interfaces';
import { computeModuleStats, formatDuration } from '@utils/module-stats';

@Component({
  selector: 'app-list-of-content',
  templateUrl: './list-of-content.component.html',
  styleUrl: './list-of-content.component.scss',
  imports: [ModulesAccordionComponent, LoaderComponent],
})
export class ListOfContentComponent {

  private userState = inject(UserState);

  // Los módulos llegan de course-page (una sola fuente de carga, compartida
  // con los badges de course-hero) en vez de que este componente haga su
  // propio fetch con courseId.
  modules = input<ModulePopulated[]>([]);
  isLoading = input<boolean>(false);

  user = computed( () => this.userState.user() );

  stats = computed( () => computeModuleStats( this.modules() ) );
  durationLabel = computed( () => formatDuration( this.stats().totalDurationMinutes ) );

  constructor( ) {  }

}
