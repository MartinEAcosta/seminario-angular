import { Component, effect, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { LessonService } from '../../services/lesson.service';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { LessonPopulated } from '../../models/lesson.interfaces';
import { ThumbnailSelectorComponent } from 'src/app/course/components/thumbnail-selector/thumbnail-selector.component';
import { FormLessonComponent } from "../form-lesson/form-lesson.component";
import { FileService } from 'src/app/shared/services/file/file.service';
import { Course } from '@course/models/course.interfaces';
import { ModuleService } from 'module/services/module.service';
import { CardActionComponent } from "src/app/shared/components/card-action/card-action.component";
import { SaveModuleComponent } from "module/components/save-module/save-module.component";
import { UIService } from 'src/app/shared/services/ui/ui.service';

@Component({
  selector: 'app-slider-content-manager',
  imports: [
    ThumbnailSelectorComponent,
    NgClass,
    FormLessonComponent,
    CardActionComponent,
    SaveModuleComponent,
  ],
  templateUrl: './slider-content-manager.component.html',
  styleUrl: './slider-content-manager.component.scss',
})
export class SliderContentManagerComponent {
  uiService = inject(UIService);
  lessonService = inject(LessonService);
  moduleService = inject(ModuleService);
  fileService = inject(FileService);

  public lessonFormState = inject(LessonFormState);

  course = input.required<Course | null>();

  lessonsResource = rxResource<LessonPopulated[], string | null>({
    request: () => this.course()?.id ?? null,
    loader: ({ request }) => {
      if (request) {
        return this.lessonService.getAllLessonPopulatedFromCourse(request).pipe(
          tap((res) => this.lessonFormState.lessons.set(res)),
          catchError((error) => {
            // * No se han podido cargar...
            return of([]);
          })
        );
      }
      return of([]);
    },
  });

  modulesResource = rxResource({
    request: () => this.course()?.id ?? null,
    loader: ({ request }) => {
      if (request) {
        return this.moduleService.getModulesByCourseId(request);
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

  onExpandSlider = () => {
    if (this.modulesResource.value.length > 0) {
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
    else{
      this.uiService.setErrorMessage('Debes crear un modulo antes de crear una lección')
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
    this.lessonFormState.setIsLessonFormVisible(true);

    if (
      this.lessonFormState.lessonSelected() &&
      !this.lessonFormState.lessonSelected()?.id
    )
      return;

    this.lessonFormState.createEmptyLesson();
  };

  onAddModule = () => {
    this.lessonFormState.toggleVisibilityOfModulePopUp();
  };
}
