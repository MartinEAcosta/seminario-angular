import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-collapsible-page-title',
  imports: [],
  templateUrl: './collapsible-page-title.component.html',
  styleUrl: './collapsible-page-title.component.scss'
})
export class CollapsiblePageTitleComponent {

  public title = input.required<string>();
  public collapsed = input<boolean>(false);

  public toggle = output<void>();

}
