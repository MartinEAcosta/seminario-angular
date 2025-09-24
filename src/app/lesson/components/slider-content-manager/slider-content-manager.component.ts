import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThumbnailSelectorComponent } from 'src/app/course/components/thumbnail-selector/thumbnail-selector.component';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { FormLessonComponent } from "../form-lesson/form-lesson.component";

@Component({
  selector: 'app-slider-content-manager',
  imports: [ThumbnailSelectorComponent, NgClass, FormLessonComponent],
  templateUrl: './slider-content-manager.component.html',
  styleUrl: './slider-content-manager.component.scss'
})
export class SliderContentManagerComponent {

  lessonFormState = inject(LessonFormState);

}
