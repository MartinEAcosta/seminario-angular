import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Wrapper sin shell visual propio: existe sólo para agrupar forgot-password y
// reset-password/:token bajo un padre común y declarar NotAuthenticatedGuard
// una vez en vez de una por ruta hija. El shell de dos columnas y el roadmap
// los sigue armando cada página — es lo único que las dos necesitan variar.
@Component({
  selector: 'app-password-recovery-layout',
  imports: [RouterOutlet],
  templateUrl: './password-recovery-layout.component.html',
  styleUrl: './password-recovery-layout.component.scss'
})
export class PasswordRecoveryLayoutComponent { }
