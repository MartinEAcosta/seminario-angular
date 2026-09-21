import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';
import { UserState } from '@user/state/user-state';

@Component({
  selector: 'app-user-profile-dropdown',
  imports: [NgClass, RouterLink],
  templateUrl: './user-profile-dropdown.component.html',
  styleUrl: './user-profile-dropdown.component.scss'
})
export class UserProfileDropdownComponent {

  router = inject(Router);
  authService = inject(AuthService);
  userState = inject(UserState);
  elementRef = inject(ElementRef);
  open = signal<boolean>(false);

constructor() {
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.open.set(false);
    });
  }

  onClickProfile ( ) : void {
    this.open.update( open => !open );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick ( event: MouseEvent ) : void {
    if( this.open() && !this.elementRef.nativeElement.contains(event.target as Node) ){
      this.open.set(false);
    }
  }

}
