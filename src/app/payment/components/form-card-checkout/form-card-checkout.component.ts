import { Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { CheckoutFormState } from '../../state/checkout-form-state';

declare global{
  interface Window {
    MercadoPago : any,
  }
}

@Component({
  selector: 'app-form-card-checkout',
  imports: [UpperCasePipe],
  templateUrl: './form-card-checkout.component.html',
  styleUrl: './form-card-checkout.component.scss'
})

export class FormCardCheckoutComponent {

  amount = input.required<Number>();

  public router = inject(Router);
  public checkoutFormState = inject(CheckoutFormState);

  constructor( ) { }

  async ngOnInit( ){
    await this.checkoutFormState.initialize();
    await this.checkoutFormState.initializeForm();
  }

  public onSubmit = () => {
    this.checkoutFormState.cardForm.onSubmit();
  }

}

