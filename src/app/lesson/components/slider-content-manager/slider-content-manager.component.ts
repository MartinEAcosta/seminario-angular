import { Component, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThumbnailSelectorComponent } from 'src/app/course/components/thumbnail-selector/thumbnail-selector.component';
import { LessonFormState } from '../../state/lesson/lesson-form-state';
import { rxResource } from '@angular/core/rxjs-interop';
import { LessonService } from '../../services/lesson.service';
import { Lesson } from '../../models/lesson.interfaces';
import { FormLessonComponent } from "../form-lesson/form-lesson.component";
import { LoaderComponent } from "src/app/shared/components/loader/loader.component";
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-slider-content-manager',
  imports: [ThumbnailSelectorComponent, NgClass, FormLessonComponent, LoaderComponent],
  templateUrl: './slider-content-manager.component.html',
  styleUrl: './slider-content-manager.component.scss'
})
export class SliderContentManagerComponent {

  public lessonService = inject(LessonService);
  public lessonFormState = inject(LessonFormState);
  public courseId = input<string | null>();
  
  public lessonsResource = rxResource<Lesson[],string>({
    request: () => this.courseId()!,
    loader: ({request}) => this.lessonService.getAllLessonFromCourse( request ),
  });

  public lessonForm : FormGroup = this.lessonFormState.createForm();

  constructor( ) { }



}
