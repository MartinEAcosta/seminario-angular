import { Component, EventEmitter, input, Output } from '@angular/core';
import { Course } from '@interfaces/course.interfaces';
import { LessonPopulated } from '@lesson/models/lesson.interfaces';

@Component({
  selector: 'app-btn-remove',
  imports: [],
  templateUrl: './btn-remove.component.html',
  styleUrl: './btn-remove.component.scss'
})
export class BtnRemoveComponent {

  item = input<Course | LessonPopulated | null>( null );

  @Output()
  onRemove = new EventEmitter();

  constructor(){ }

  onClick = () => {
    this.onRemove.emit();
  }
}
