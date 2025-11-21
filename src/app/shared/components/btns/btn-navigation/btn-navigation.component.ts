import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-btn-navigation',
  imports: [NgClass],
  templateUrl: './btn-navigation.component.html',
  styleUrls: ['./btn-rounded.scss','./btn-navigation.component.scss']
})
export class BtnNavigationComponent {


  public text = input.required<string>();
  public isNextButton = input.required<boolean>(  );
}
