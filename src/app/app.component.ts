import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/layout/header/header.component';
import { FooterComponent } from './shared/components/layout/footer/footer.component';
import { ModalErrorMessageComponent } from "./shared/components/modal-error-message/modal-error-message.component";
import { AuthService } from '@auth/services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, HeaderComponent, FooterComponent, ModalErrorMessageComponent]
})
export class AppComponent {

  // Fuerza la instanciación del singleton en el boot del app: dispara
  // AuthService.checkStatusResource (renueva sesión vía x-token) antes de
  // que corra cualquier guard. Ningún otro punto del árbol de inyección
  // ahora eager (guards/header ya migraron a UserState) lo hace por sí solo.
  private authService = inject(AuthService);

}
