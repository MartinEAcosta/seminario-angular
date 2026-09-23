import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-checkout-steps',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './checkout-steps.component.html',
  styleUrl: './checkout-steps.component.scss'
})
export class CheckoutStepsComponent {

  cartEmpty = input.required<boolean>();

}
