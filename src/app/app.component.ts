import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
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
