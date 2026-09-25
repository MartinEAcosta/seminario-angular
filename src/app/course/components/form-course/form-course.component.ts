import { Component, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { CourseFormState } from '../../state/course-form/course-form-state';
import { Course } from '@course/models/course.interfaces';
import { CollapsiblePageTitleComponent } from "../collapsible-page-title/collapsible-page-title.component";

@Component({
  selector: 'app-form-course',
  templateUrl: './form-course.component.html',
  styleUrl: './form-course.component.scss',
  imports: [
    RouterLink, RouterLinkActive, RouterOutlet, CollapsiblePageTitleComponent
  ],
})
export class FormCourseComponent {

  public courseFormState = inject(CourseFormState);

  course = input.required<Course | null>();

  settled = signal<boolean>( !this.courseFormState.isFormCollapsed() );

  constructor ( ) { }

  public onToggleCollapse ( ) : void {
    this.settled.set(false);
    this.courseFormState.toggleFormCollapsed();
  }

  public onCollapseTransitionEnd ( event : TransitionEvent ) : void {
    if( event.propertyName === 'grid-template-rows' && !this.courseFormState.isFormCollapsed() ) {
      this.settled.set(true);
    }
  }

  ngOnInit(): void {
    const course = this.course();
    if (course) {
      this.courseFormState.patchValuesForm(course);
    }
    else{
      this.courseFormState.reset();
    }
  }

  ngOnDestroy() {
    this.courseFormState.reset();
  }

}
