import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-user-profile-dropdown',
  imports: [NgClass],
  templateUrl: './user-profile-dropdown.component.html',
  styleUrl: './user-profile-dropdown.component.scss'
})
export class UserProfileDropdownComponent {

  router = inject(Router);
  authService = inject(AuthService);
  open = signal<boolean>(false);

constructor() {
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.open.set(false);
    });
  }

  onClickProfile () {
    this.open.update( open => !open );
  }

}
