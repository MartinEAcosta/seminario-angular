import { Component, Signal, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  isLoginMode : WritableSignal<boolean> = signal(true);

  onChangeMode = ( event : MouseEvent ) : void  => {
    event.preventDefault;
    this.isLoginMode.update(value => !value);
  }

}
