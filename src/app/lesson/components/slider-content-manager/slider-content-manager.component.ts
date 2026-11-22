import { Component, effect, inject, input, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { LessonService } from '../../services/lesson.service';
import { LessonPopulated } from '../../models/lesson.model';
import { ThumbnailSelectorComponent } from '@course/components/thumbnail-selector/thumbnail-selector.component';
import { FormLessonComponent } from "../form-lesson/form-lesson.component";
import { Course } from '@course/models/course.model';
import { ModuleService } from '@module/services/module.service';
import { CardActionComponent } from "@shared/components/card-action/card-action.component";
import { SaveModuleComponent } from "@module/components/save-module/save-module.component";
import { ToastService } from '@shared/services/toast/toast.service';
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { LessonFormState } from '@lesson/state/lesson-form/lesson-form-state';

@Component({
  selector: 'app-slider-content-manager',
  imports: [
    ThumbnailSelectorComponent,
    NgClass,
    FormLessonComponent,
    CardActionComponent,
    SaveModuleComponent,
    LoaderComponent
],
  templateUrl: './slider-content-manager.component.html',
  styleUrl: './slider-content-manager.component.scss',
})
export class SliderContentManagerComponent implements OnDestroy {

  toastService = inject(ToastService);
  lessonService = inject(LessonService);
  moduleService = inject(ModuleService);
  lessonFormState = inject(LessonFormState);

  course = input.required<Course | null>();

  lessonsResource = rxResource<LessonPopulated[], string | null>({
      params: () => this.course()?.id ?? null,
    stream: ({ params }) => {
      if (params) {
        return this.lessonService.getAllLessonPopulatedFromCourse(params).pipe(
          tap((res) => this.lessonFormState.lessons.set(res)),
          catchError(() => {
            // Se degrada a lista vacía para no romper la pantalla, pero avisa:
            // antes fallaba en silencio y el usuario leía "sin lecciones" cuando
            // lo que pasó es que no se pudieron cargar (ver SPEC 16).
            this.toastService.showError('No pudimos cargar las lecciones del curso.');
            return of([]);
          })
        );
      }
      return of([]);
    },
  });

  modulesResource = rxResource({
    params: () => ({ id: this.course()?.id ?? null }),
    stream: ({ params }) => {
      if (params.id) {
        return this.moduleService.getModulesByCourseId(params.id);
      }
      return of([]);
    },
  });

  constructor() {
    effect(() => {
      if (
        this.lessonFormState.lessonSelected() != undefined &&
        this.lessonFormState.lessonSelected()?.file.url != null
      ) {
        this.lessonFormState.setTempMedia(
          this.lessonFormState.lessonSelected()!.file.url!
        );
      }
    });
  }

  ngOnDestroy() {
    this.lessonFormState.reset();
  }

  validateCourseContainModules = ( ) : boolean => {
    const modules = this.modulesResource.value();
    if ( modules && modules.length > 0) {
      return true;
    }
    else{
      this.lessonFormState.setIsModulePopUpVisible(true);
      this.toastService.showWarning('Debes crear un modulo antes de crear una lección')
      return false;
    }
  }

  onExpandSlider = () => {
    if( this.validateCourseContainModules() ){
      if (this.lessonFormState.isLessonFormVisible()) {
        this.lessonFormState.toggleVisibilityOfLessonForm();
      } else {
        if (this.lessonFormState.lessons().length === 0) {
          const newLesson = this.lessonFormState.createEmptyLesson();
          this.onSelectLesson(newLesson);
        } else {
          const firstLesson = this.lessonFormState.lessons()[0];
          this.onSelectLesson(firstLesson);
        }
      }
    }
  };

  onSelectLesson = (lesson: LessonPopulated) => {
    this.lessonFormState.setLessonSelected(lesson);
    this.lessonFormState.patchValuesForm(lesson);
    this.lessonFormState.setTempMedia(
      this.lessonFormState.lessonSelected()!.file.url!
    );
    this.lessonFormState.setIsLessonFormVisible(true);
  };

  onAddLesson = () => {
    if( this.validateCourseContainModules() ) {
      this.lessonFormState.setIsLessonFormVisible(true);
      
      if (
        this.lessonFormState.lessonSelected() &&
        !this.lessonFormState.lessonSelected()?.id
      )
      return;
      
      this.lessonFormState.createEmptyLesson();
    }
  };

  onAddModule = () => {
    if( !this.course()?.id ){
      this.toastService.showWarning('Debes crear el curso antes de agregar un módulo');
      return;
    }
    this.lessonFormState.toggleVisibilityOfModulePopUp();
  };
}
