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
    // console.log(event);
    // const cart = document.querySelector('.bg-cart');
    // cart?.classList.add("open");

    // const contentOpened = document.querySelector('.content-open');
    // contentOpened?.classList.remove("hidden");

  }

}
