import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Course } from '@course/models/course.interfaces';
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { ModuleService } from '@module/services/module.service';
import { VjsPlayerComponent } from "@shared/components/vjs-player/vjs-player.component";

@Component({
  selector: 'app-lesson-viewer-page',
  imports: [ListOfContentComponent, VjsPlayerComponent],
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss'
})
export class LessonViewerPageComponent {
  
  moduleService = inject(ModuleService);
  resolvedCourse = input.required<Course>();

  modulesResource = rxResource({
    request : () => ({ courseId : this.resolvedCourse().id }),
    loader  : ( {request} ) => {
      return this.moduleService.getModulesByCourseId( request.courseId );
    },
  });

}
