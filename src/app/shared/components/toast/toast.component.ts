import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { ToastService } from '../../services/toast/toast.service';
import type { Toast, ToastSeverity } from '../../services/toast/toast.service';

@Component({
  selector: 'app-toast',
  imports: [ NgClass ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  host: { '[class]': 'severity()' }
})
export class ToastComponent {

  toastService = inject(ToastService);
  toast = computed( () => this.toastService.toast() );
  fadeAnimation = signal<boolean>(false);

  // Conserva la última severidad cuando el toast ya es null: si cayera a un
  // default, un toast de éxito terminaría en rojo con icono de error durante
  // los 0.5s de la animación de salida. El 'error' final solo cubre el primer
  // render, cuando todavía no hubo ningún toast.
  severity = linkedSignal<Toast | null, ToastSeverity>({
    source      : this.toast,
    computation : ( toast , previous ) => toast?.severity ?? previous?.value ?? 'error',
  });

  onToastChange = effect(() => {
    const toastRef = this.toast();

    if( toastRef ){
      this.fadeAnimation.set(true);
    }
    else{
      this.fadeAnimation.set(false);
    }
  })

}
