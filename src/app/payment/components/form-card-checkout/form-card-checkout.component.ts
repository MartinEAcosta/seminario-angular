import {
  AfterViewInit,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckoutFormState } from '../../state/checkout-form-state';

declare global {
  interface Window {
    MercadoPago: any,
  }
}

@Component({
  selector: 'app-form-card-checkout',
  imports: [UpperCasePipe, ReactiveFormsModule],
  templateUrl: './form-card-checkout.component.html',
  styleUrl: './form-card-checkout.component.scss'
})

export class FormCardCheckoutComponent implements AfterViewInit, OnDestroy {

  amount = input.required<number>();

  public router = inject(Router);
  public checkoutFormState = inject(CheckoutFormState);

  public cardholderForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    identificationType: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    identificationNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  constructor() {
    // Sync unidireccional del input hacia el estado: el monto lo necesita el lookup de
    // cuotas, que corre adentro de CheckoutFormState.
    effect(() => this.checkoutFormState.setAmount(Number(this.amount())));
  }

  async ngAfterViewInit() {
    await this.checkoutFormState.initialize();
    this.checkoutFormState.mountFields({
      cardNumber: 'form-checkout__cardNumber',
      expirationDate: 'form-checkout__expirationDate',
      securityCode: 'form-checkout__securityCode',
    });
  }

  ngOnDestroy() {
    this.checkoutFormState.unmountFields();
    this.checkoutFormState.reset();
  }

  public onInstallmentsChange = (event: Event) => {
    this.checkoutFormState.selectInstallments(Number((event.target as HTMLSelectElement).value));
  }

  public onSubmit = async () => {
    if (this.cardholderForm.invalid) {
      this.cardholderForm.markAllAsTouched();
      return;
    }

    const result = await this.checkoutFormState.submit(this.cardholderForm.getRawValue());
    if (result.ok) {
      this.checkoutFormState.unmountFields();
      this.router.navigate(['/payment/buy/confirmation'], { state: { order: result.order } });
    }
  }

}
