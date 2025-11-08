import { NgClass } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'app-card-action',
  imports: [NgClass],
  templateUrl: './card-action.component.html',
  styleUrl: './card-action.component.scss'
})
export class CardActionComponent {

  @Output()
  action = new EventEmitter<void>();

  svgPath1 = input<string | null>();
  svgPath2 = input<string | null>();
  textAction = input.required<string>();

  constructor() { }

  onClickCard = () => {
    this.action.emit();
  }
}
