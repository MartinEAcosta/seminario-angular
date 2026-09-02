import { inject, Injectable } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from '../../../environments/environment';
import { CartService } from '@cart/state/cart.service';

@Injectable({
  providedIn: 'root',
})
export class CheckoutFormState {
  private paymentService = inject(PaymentService);
  private cartService = inject(CartService);
  public mp: any = undefined;
  public cardForm: any;

  public identificationTypeResource = rxResource({
    stream: () => {
      return this.paymentService.getAllIdentificationTypes();
    },
  });

  constructor() {}

  public initialize = async () => {
    if (this.mp != undefined) return this.mp;
    await this.initializeMercadoPago();
  };

  private initializeMercadoPago = async () => {
    try {
      await loadMercadoPago();
      this.mp = new window.MercadoPago(
        `${environment.MERCADOPAGO_PUBLIC_KEY}`,
        {
          locale: 'es-AR',
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  public initializeForm = async () => {
    if (this.cardForm) {
      this.cardForm.unmount();
    }

    this.cardForm = this.mp.cardForm({
      amount: `${this.cartService.calculateTotal()}`,
      iframe: true,
      form: {
        id: 'form-checkout',
        cardNumber: {
          id: 'form-checkout__cardNumber',
          placeholder: '0000 0000 0000 0000',
        },
        expirationDate: {
          id: 'form-checkout__expirationDate',
          placeholder: 'MM/YY',
        },
        securityCode: {
          id: 'form-checkout__securityCode',
          placeholder: '123',
        },
        cardholderName: {
          id: 'form-checkout__cardholderName',
          placeholder: 'Como figura en la tarjeta',
        },
        identificationType: {
          id: 'form-checkout__identificationType',
        },
        identificationNumber: {
          id: 'form-checkout__identificationNumber',
          placeholder: '12345678',
        },
        issuer: {
          id: 'form-checkout__issuer',
        },
        installments: {
          id: 'form-checkout__installments',
        },
        cardholderEmail: {
          id: 'form-checkout__cardholderEmail',
          placeholder: 'nombre@ejemplo.com',
        },
      },
      callbacks: {
        onFormMounted: (error: any) => {
          if (error) {
            console.log('form error: ' + error);
            return;
          }

          console.log('montado bien');
        },
        onSubmit: async (event: Event) => {
          event.preventDefault();
          const {
            paymentMethodId: payment_method_id,
            issuerId: issuer_id,
            cardholderEmail: email,
            token,
            installments,
            identificationNumber,
            identificationType,
          } = this.cardForm.getCardFormData();
          // const data = this.cardForm.getCardFormData();
          // console.log('Datos del formulario:', data);
          await this.paymentService
            .createPayment({
              items: this.cartService.getItemsArray(),
              payment_method_id,
              issuer_id,
              email,
              token,
              installments,
              identificationNumber,
              identificationType,
              code : this.cartService.cart().code
            })
            .subscribe();
        },
        onError: (error: any) => {
          console.error('Error del SDK de Mercado Pago:', error);
        },
      },
    });
  };
}
