import { Component, inject, input, OnInit } from '@angular/core';

import { AuthService } from '@auth/services/auth.service';

@Component({
    selector: 'app-google-auth-button',
    templateUrl: './google-auth-button.component.html',
    styleUrls: ['../../form-global.scss'],
})
export class GoogleAuthButtonComponent implements OnInit {

  private authService = inject(AuthService);

  label = input('Continuar con Google');

  ngOnInit() {
    this.authService.prepareGoogle().catch( err => console.error('Error preparando Google Auth', err) );
  }

  onClick = () => {
    this.authService.continueWithGoogle();
  }

}
