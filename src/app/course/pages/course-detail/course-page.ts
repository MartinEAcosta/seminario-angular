import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

import { CourseService } from '../../services/course.service';
import { ModuleService } from '@module/services/module.service';
import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { CourseHeroComponent } from '@course/components/course-hero/course-hero.component';
import { CoursePurchasePanelComponent } from '@course/components/course-purchase-panel/course-purchase-panel.component';
import { CourseInstructorComponent } from '@course/components/course-instructor/course-instructor.component';
import { computeModuleStats } from '@utils/module-stats';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.html',
  styleUrl: './course-page.scss',
  imports: [
    LoaderComponent,
    ListOfContentComponent,
    CourseHeroComponent,
    CoursePurchasePanelComponent,
    CourseInstructorComponent,
    RouterLink,
]
})
export class CoursePage {

  private activatedRoute = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private moduleService = inject(ModuleService);
  private enrollmentState = inject(EnrollmentState);

  private courseId = this.activatedRoute.snapshot.params['id'] || '';

  courseResource = rxResource({
    params : ( ) => ( { id : this.courseId } ),
    stream : ( { params  } ) => {
      if( params.id === '' ) return of();

      return this.courseService.getById( params.id )
    },
  });

  // Única fuente de carga de módulos de esta página — course-hero,
  // list-of-content y el panel de compra (lessonsCount) leen del mismo
  // resource, así los conteos nunca quedan desincronizados entre sí.
  modulesResource = rxResource({
    params : ( ) => ( { id_course : this.courseId } ),
    stream : ( { params } ) => {
      if( params.id_course === '' ) return of([]);

      return this.moduleService.getModulesByCourseId( params.id_course );
    },
  });

  modules = computed( () => this.modulesResource.value() ?? [] );
  moduleStats = computed( () => computeModuleStats( this.modules() ) );

  enrollmentIdFor = ( id_course : string ) : string | null => {
    const enrollment = this.enrollmentState.enrollmentList().find( e => e.course.id_course === id_course );
    return enrollment?.id ?? null;
  }

  constructor() { }

}
