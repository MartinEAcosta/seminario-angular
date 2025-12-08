import { Component, computed, effect, inject, signal } from '@angular/core';
import { UIService } from '../../services/ui/ui.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-modal-error-message',
  imports: [ NgClass ],
  templateUrl: './modal-error-message.component.html',
  styleUrl: './modal-error-message.component.scss'
})
export class ModalErrorMessageComponent {

  uiService = inject(UIService);
  errorMessage = computed( () => this.uiService.errorMessage() );
  fadeAnimation = signal<boolean>(false);

  onErrorMessageChange = effect(() => {
    const errorMessageRef = this.errorMessage();
    
    if( errorMessageRef ){
      this.fadeAnimation.set(true);
    }else{
      this.fadeAnimation.set(false);
    }
  })

}
