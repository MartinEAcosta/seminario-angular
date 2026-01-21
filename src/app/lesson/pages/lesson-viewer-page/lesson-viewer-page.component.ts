import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject} from '@angular/core';
import { NgClass } from '@angular/common';

import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { VjsPlayerComponent } from "@shared/components/vjs-player/vjs-player.component";
import { ListOfContentComponent } from "@lesson/components/list-of-content/list-of-content.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { CourseState } from '@course/state/course-state';
import { LessonState } from '@lesson/state/lesson-state';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-lesson-viewer-page',
  templateUrl: './lesson-viewer-page.component.html',
  styleUrl: './lesson-viewer-page.component.scss',
  imports: [VjsPlayerComponent, ListOfContentComponent, LoaderComponent, NgClass]
})
export class LessonViewerPageComponent {

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute)
  
  lessonId = toSignal<string>(this.activatedRoute.params.pipe( map( (p) => p['id_lesson'] )));
  enrollmentState = inject(EnrollmentState);
  courseState = inject(CourseState);
  lessonState = inject(LessonState);

  ngOnInit( ) { 
    const enrollment = this.enrollmentState.selectedEnrollment();
    if( !enrollment ) return;
    
    if( !this.lessonId() ) {
      this.lessonState.loadNextLesson( enrollment.id! ).subscribe(
        lesson => {
          console.log(lesson)
          this.router.navigate(
            ['lesson' , lesson!.id],
            { relativeTo : this.activatedRoute } 
          );
        }
      );
    } 
    else {
      this.lessonState.loadLesson( this.lessonId()! ).subscribe(
        lesson => {
          if( !lesson ) {
            this.router.navigate(
              ['/'],
            );
            return;
          }
        }
      );
    }
    return;
  }

  }