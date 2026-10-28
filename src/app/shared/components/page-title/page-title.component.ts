import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-title',
  imports: [],
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.scss'
})
export class PageTitleComponent {

  public eyebrow = input<string | null>(null);
  public title = input.required<string>();
  public subtitle = input<string | null>(null);

}
