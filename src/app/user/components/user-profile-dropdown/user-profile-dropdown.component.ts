import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-user-profile-dropdown',
  imports: [NgClass],
  templateUrl: './user-profile-dropdown.component.html',
  styleUrl: './user-profile-dropdown.component.scss'
})
export class UserProfileDropdownComponent {

  authService = inject(AuthService);
  open = signal<boolean>(true);

  constructor ( ) { }

  ngOnDestroy () {
    this.open.set(false);
  }

  onClickProfile () {
    this.open.update( open => !open );
  }

}
