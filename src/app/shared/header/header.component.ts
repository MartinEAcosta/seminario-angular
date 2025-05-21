import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  brandName = 'Udemix';

  @HostListener('window:scroll')
  onScroll = (  ) => {
    
    const header = document.querySelector('header'); 

    const scrollY = window.scrollY;
    const maxScroll = 400;
    
    if( header ) {
      
      let opacity =  1 - (scrollY / 5) / maxScroll;

      opacity = Math.max(0, Math.min(1, opacity));
      header.style.backgroundColor = `rgba(233, 233, 233, ${opacity})`;
      header.style.transition = 'opacity 0.2s ease-out';
    }
    
  }
}
