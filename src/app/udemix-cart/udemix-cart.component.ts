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
    console.log(event);
    const cart = document.querySelector('.content-closed');
    cart?.classList.remove("content-closed");
    cart?.classList.add("content-open");
  }

}
