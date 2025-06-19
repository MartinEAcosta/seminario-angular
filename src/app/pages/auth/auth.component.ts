/*
    Path:PORT/auth
*/
import { Component, Input, signal, WritableSignal } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FormLoginComponent } from '../../auth/form-login/form-login.component';
import { FormRegisterComponent } from '../../auth/form-register/form-register.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss',
    imports: [HeaderComponent, FormLoginComponent, FormRegisterComponent, FooterComponent]
})
export class AuthComponent {

  isLoginMode : WritableSignal<boolean> = signal(true);

  onChangeMode = ( ) : void  => {
    this.isLoginMode.update(value => !value);
  }

}
