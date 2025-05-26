import { Component } from '@angular/core';

@Component({
  selector: 'app-udemix-cart',
  standalone: false,
  templateUrl: './udemix-cart.component.html',
  styleUrl: './udemix-cart.component.scss'
})
export class UdemixCartComponent {

  isCartOpen : boolean = false;

  onToggleCart = ( ) : void => {

    this.isCartOpen = !this.isCartOpen;

    // this.isCartOpen = !this.isCartOpen;
  }

  onCloseCart = ( ) : void => {
    
    const clickedContainer = event?.target as HTMLElement;

    if( clickedContainer.classList.contains('overlay') ){
      this.isCartOpen = false;
    }

  }


}
