import { Component, ElementRef, HostListener, inject, viewChild } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { RouterLink, Scroll } from '@angular/router';
import { ɵDomEventsPlugin } from '@angular/platform-browser';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [RouterLink]
})
export class HeaderComponent {

  authService = inject(AuthService);

  brandName = 'Udemix';
    
}

