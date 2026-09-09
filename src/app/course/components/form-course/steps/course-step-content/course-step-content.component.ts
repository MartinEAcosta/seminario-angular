import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';

import { CourseFormState } from '@course/state/course-form/course-form-state';
import { ModuleService } from '@module/services/module.service';
import { SaveModuleComponent } from '@module/components/save-module/save-module.component';
import { CourseModuleItemComponent } from './course-module-item/course-module-item.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-course-step-content',
  imports: [RouterLink, SaveModuleComponent, CourseModuleItemComponent, LoaderComponent],
  templateUrl: './course-step-content.component.html',
  styleUrl: './course-step-content.component.scss'
})
export class CourseStepContentComponent {

  public courseFormState = inject(CourseFormState);
  private moduleService = inject(ModuleService);

  isAddingModule = signal(false);

  modulesResource = rxResource({
    params: () => ({ courseId: this.courseFormState.courseId() }),
    stream: ({ params }) => {
      return params.courseId
        ? this.moduleService.getModulesByCourseId( params.courseId )
        : of([]);
    },
  });

  onAddModule = () => {
    this.isAddingModule.set(true);
  }

  onModuleSaved = () => {
    this.isAddingModule.set(false);
    this.modulesResource.reload();
  }

}
