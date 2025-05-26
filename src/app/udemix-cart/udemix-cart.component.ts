import { Component } from '@angular/core';

@Component({
  selector: 'app-udemix-cart',
  standalone: false,
  templateUrl: './udemix-cart.component.html',
  styleUrl: './udemix-cart.component.scss'
})
export class UdemixCartComponent {

  isCartOpen : boolean = false;

  delayText : boolean = false;


  onToggleCart = ( ) : void => {
    this.isCartOpen = !this.isCartOpen
    setTimeout(
      () => this.delayText = !this.delayText , 
      200
    );
    
  
    // console.log(event);
    // const cart = document.querySelector('.bg-cart');
    // cart?.classList.add("open");

    // const contentOpened = document.querySelector('.content-open');
    // contentOpened?.classList.remove("hidden");

  }

}
