import { Component, HostListener, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [RouterLink]
})
export class HeaderComponent {

  authService = inject(AuthService);

  brandName = 'Udemix';

  @HostListener('window:scroll')
  onScroll = (  ) => {
    
    const header = document.querySelector('header'); 

    const scrollY = window.scrollY;
    const maxScroll = 400;
    
    if( header ) {
      
      let opacity =  1 - (scrollY / 20) / maxScroll;

      opacity = Math.max(0, Math.min(1, opacity));
      header.style.backgroundColor = `rgba(233, 233, 233, ${opacity})`;
      header.style.transition = 'opacity 0.2s ease-out';
    }
    
  }
}
