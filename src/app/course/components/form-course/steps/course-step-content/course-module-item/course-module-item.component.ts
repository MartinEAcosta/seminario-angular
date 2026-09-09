import { Component, inject, input, output, signal } from '@angular/core';

import { LessonService } from '@lesson/services/lesson.service';
import { LessonFormState } from '@lesson/state/lesson-form/lesson-form-state';
import { ModulePopulated, Module } from '@module/models/module.interfaces';
import { SaveModuleComponent } from '@module/components/save-module/save-module.component';
import { FormLessonComponent } from '@lesson/components/form-lesson/form-lesson.component';

@Component({
  selector: 'app-course-module-item',
  imports: [SaveModuleComponent, FormLessonComponent],
  templateUrl: './course-module-item.component.html',
  styleUrl: './course-module-item.component.scss'
})
export class CourseModuleItemComponent {

  private lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);

  module = input.required<ModulePopulated>();
  idCourse = input.required<string>();
  allModules = input.required<ModulePopulated[]>();

  contentChanged = output<void>();

  isExpanded = signal(false);
  isEditingModule = signal(false);
  isAddingLesson = signal(false);
  editingLessonId = signal<string | null>(null);

  toggleExpand = () => {
    this.isExpanded.set( !this.isExpanded() );
  }

  onEditModule = () => {
    this.isEditingModule.set(true);
  }

  onModuleSaved = ( module : Module ) => {
    this.isEditingModule.set(false);
    this.contentChanged.emit();
  }

  onEditLesson = ( lesson : { id : string , title : string } ) => {
    this.lessonService.getLessonPopulatedById( lesson.id ).subscribe( ( full ) => {
      this.lessonFormState.setLessonSelected( full );
      this.isAddingLesson.set(false);
      this.editingLessonId.set( lesson.id );
    });
  }

  onDeleteLesson = ( lesson : { id : string , title : string } ) => {
    this.lessonService.deleteLesson( lesson.id ).subscribe( ( isLessonDeleted ) => {
      if( isLessonDeleted ){
        this.contentChanged.emit();
      }
    });
  }

  onAddLesson = () => {
    this.lessonFormState.lessonForm.reset();
    this.lessonFormState.setLessonSelected(null);
    this.lessonFormState.setTempMedia(null);
    this.lessonFormState.setMediaFile(null);
    this.lessonFormState.lessonForm.get('id_module')?.setValue( this.module().id );
    this.editingLessonId.set(null);
    this.isAddingLesson.set(true);
  }

  onLessonSaved = () => {
    this.closeLessonPanel();
    this.contentChanged.emit();
  }

  closeLessonPanel = () => {
    this.isAddingLesson.set(false);
    this.editingLessonId.set(null);
    this.lessonFormState.setLessonSelected(null);
  }

}
