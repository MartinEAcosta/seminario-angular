import { Component } from '@angular/core';

@Component({
  selector: 'app-udemix-cart',
  standalone: false,
  templateUrl: './udemix-cart.component.html',
  styleUrl: './udemix-cart.component.scss'
})
export class UdemixCartComponent {

  isCartOpen : boolean = false;

  onOpenCart = ( ) : void => {

    if( this.isCartOpen ) {
      return;
    }

    this.isCartOpen = !this.isCartOpen;

  }

  onCloseCart = ( ) : void => {
    
    const clickedContainer = event?.target as HTMLElement;

    if( clickedContainer.classList.contains('overlay') ){
      this.isCartOpen = false;
    }

  }

  onUpQuantity = ( ) : void => {
    
  }


}
