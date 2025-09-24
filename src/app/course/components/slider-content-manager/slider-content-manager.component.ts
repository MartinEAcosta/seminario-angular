import { Component } from '@angular/core';
import { ThumbnailSelectorComponent } from "../thumbnail-selector/thumbnail-selector.component";

@Component({
  selector: 'app-slider-content-manager',
  imports: [ThumbnailSelectorComponent],
  templateUrl: './slider-content-manager.component.html',
  styleUrl: './slider-content-manager.component.scss'
})
export class SliderContentManagerComponent {

}
