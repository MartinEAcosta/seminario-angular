import { NavigationEnd, Router } from '@angular/router';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-user-profile-dropdown',
  imports: [NgClass],
  templateUrl: './user-profile-dropdown.component.html',
  styleUrl: './user-profile-dropdown.component.scss'
})
export class UserProfileDropdownComponent {

  private router = inject(Router);
  authService = inject(AuthService);
  open = signal<boolean>(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => {
        this.open.set(false);
      });
  }

  onClickProfile ( ) : void {
    this.open.update( open => !open );
  }

  onCloseDropdown ( ) : void {
    const clickedContainer = event?.target as HTMLElement;
    if( clickedContainer.classList.contains('overlay') ){
      this.open.set(false);
    }
  }

}
