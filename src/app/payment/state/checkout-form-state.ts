import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from '../../../environments/environment';

import { PaymentService } from '../services/payment.service';
import { CartService } from '@cart/state/cart.service';
import { CreateOrderRequestDTO } from '../models/payment.interface';
import { Order } from '../models/order.interface';
import {
  MPFieldInstance,
  MPInstance,
  MPPayerCost,
  MPPaymentMethodResult,
} from '../models/mercadopago-fields.interface';

interface FieldContainerIds {
  cardNumber: string;
  expirationDate: string;
  securityCode: string;
}

interface CardholderFormValue {
  firstName: string;
  lastName: string;
  identificationType: string;
  identificationNumber: string;
  email: string;
}

type SubmitResult = { ok: true; order: Order } | { ok: false; error: string };

// Mapea tokens de src/variables.scss a literales JS: la Fields API corre dentro de un
// iframe propio de MercadoPago, no puede leer SCSS ni usar clamp()/custom properties.
const MP_FIELD_STYLE = {
  color: 'rgb(40, 40, 40)', // = v.$black-custom
  fontSize: '16px',
  fontFamily: '"Montserrat", sans-serif', // = v.$font-primary
  fontWeight: '500',
  placeholderColor: 'rgba(40, 40, 40, 0.4)',
};

@Injectable({
  providedIn: 'root',
})
export class CheckoutFormState {
  private paymentService = inject(PaymentService);
  private cartService = inject(CartService);

  private mp?: MPInstance;
  private cardNumberField?: MPFieldInstance;
  private expirationDateField?: MPFieldInstance;
  private securityCodeField?: MPFieldInstance;

  // Todo el estado se escribe sólo desde adentro: hacia afuera se expone como computed
  // de lectura, y las dos mutaciones que el componente necesita pasan por setAmount() y
  // selectInstallments(). Mismo patrón que UserState.
  private _amount = signal<number>(0);

  private _paymentMethod = signal<MPPaymentMethodResult | null>(null);
  private _installmentOptions = signal<MPPayerCost[]>([]);
  private _selectedInstallments = signal<number | null>(null);

  private _isLoadingBinLookup = signal(false);
  private _isSubmitting = signal(false);
  private _submitError = signal<string | null>(null);

  public amount = computed(this._amount);
  public paymentMethod = computed(this._paymentMethod);
  public installmentOptions = computed(this._installmentOptions);
  public selectedInstallments = computed(this._selectedInstallments);
  public isLoadingBinLookup = computed(this._isLoadingBinLookup);
  public isSubmitting = computed(this._isSubmitting);
  public submitError = computed(this._submitError);

  public identificationTypeResource = rxResource({
    stream: () => this.paymentService.getAllIdentificationTypes(),
  });

  public setAmount = (value: number) => {
    if (!Number.isFinite(value) || value < 0) return;
    this._amount.set(value);
  };

  public selectInstallments = (installments: number) => {
    const isOffered = this._installmentOptions().some(
      (option) => option.installments === installments,
    );
    if (!isOffered) return;
    this._selectedInstallments.set(installments);
  };

  public initialize = async () => {
    if (this.mp != undefined) return this.mp;
    await this.initializeMercadoPago();
    return this.mp;
  };

  private initializeMercadoPago = async () => {
    try {
      await loadMercadoPago();
      this.mp = new window.MercadoPago(
        `${environment.MERCADOPAGO_PUBLIC_KEY}`,
        {
          locale: 'es-AR',
        },
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  public mountFields = ({
    cardNumber,
    expirationDate,
    securityCode,
  }: FieldContainerIds) => {
    // Sin SDK no hay iframes que montar: avisamos en vez de dejar tres cajas vacías.
    if (!this.mp) {
      this._submitError.set(
        'No pudimos cargar el formulario de pago. Recargá la página e intentá de nuevo.',
      );
      return;
    }

    this.cardNumberField = this.mp.fields
      .create('cardNumber', {
        placeholder: '0000 0000 0000 0000',
        style: MP_FIELD_STYLE,
      })
      .mount(cardNumber);
    this.expirationDateField = this.mp.fields
      .create('expirationDate', { placeholder: 'MM/YY', style: MP_FIELD_STYLE })
      .mount(expirationDate);
    this.securityCodeField = this.mp.fields
      .create('securityCode', { placeholder: '123', style: MP_FIELD_STYLE })
      .mount(securityCode);

    this.cardNumberField!.on(
      'binChange',
      (event: { bin: string | null; field: string }) =>
        this.onBinChange(event.bin),
    );
  };

  public unmountFields = () => {
    this.cardNumberField?.unmount();
    this.expirationDateField?.unmount();
    this.securityCodeField?.unmount();
    this.cardNumberField = undefined;
    this.expirationDateField = undefined;
    this.securityCodeField = undefined;
    this.resetBinDerivedState();
  };

  // El servicio es providedIn:'root', así que sin esto el monto y el último error
  // sobreviven al destroy del componente y reaparecen en el checkout siguiente.
  public reset = () => {
    this._amount.set(0);
    this._submitError.set(null);
    this._isSubmitting.set(false);
    this._isLoadingBinLookup.set(false);
    this.resetBinDerivedState();
  };

  private onBinChange = async (bin: string | null) => {
    if (!bin || !this.mp) {
      this.resetBinDerivedState();
      return;
    }

    this._isLoadingBinLookup.set(true);
    this._submitError.set(null);
    try {
      const methods = await this.mp.getPaymentMethods({ bin });
      const method: MPPaymentMethodResult | null = methods.results?.[0] ?? null;
      this._paymentMethod.set(method);

      if (!method) {
        this.resetBinDerivedState();
        return;
      }

      const installments = await this.mp.getInstallments({
        amount: `${this._amount()}`,
        bin,
      });

      const payerCosts: MPPayerCost[] = installments[0]?.payer_costs ?? [];
      this._installmentOptions.set(payerCosts);
      this._selectedInstallments.set(payerCosts[0]?.installments ?? null);
    } catch (error) {
      console.log(error);
      this._submitError.set(
        'No pudimos validar la tarjeta. Revisá el número e intentá de nuevo.',
      );
      this.resetBinDerivedState();
    } finally {
      this._isLoadingBinLookup.set(false);
    }
  };

  private resetBinDerivedState = () => {
    this._paymentMethod.set(null);
    this._installmentOptions.set([]);
    this._selectedInstallments.set(null);
  };

  public submit = async (
    formValue: CardholderFormValue,
  ): Promise<SubmitResult> => {
    if (this._isSubmitting()) {
      return { ok: false, error: 'Ya hay un pago en curso.' };
    }

    const paymentMethod = this._paymentMethod();
    const installments = this._selectedInstallments();
    if (!paymentMethod || !installments || !this.mp) {
      const error = 'Completá los datos de la tarjeta.';
      this._submitError.set(error);
      return { ok: false, error };
    }

    this._isSubmitting.set(true);
    this._submitError.set(null);
    try {
      const items = this.cartService.getItemsArray();

      const tokenResponse = await this.mp.fields.createCardToken({
        cardholderName: `${formValue.firstName} ${formValue.lastName}`.trim(),
        identificationType: formValue.identificationType,
        identificationNumber: formValue.identificationNumber,
      });

      // Este payload no se loguea nunca: lleva el token de la tarjeta, el mail y el documento.
      const payload: CreateOrderRequestDTO = {
        items,
        token: tokenResponse.id,
        payment_method_id: paymentMethod.id,
        payment_method_type: paymentMethod.payment_type_id,
        installments,
        payer: {
          email: formValue.email,
          first_name: formValue.firstName,
          last_name: formValue.lastName,
          identification: {
            type: formValue.identificationType,
            number: formValue.identificationNumber,
          },
        },
      };

      const order = await firstValueFrom(
        this.paymentService.createOrder( payload ),
      );
      return { ok: true, order };
    } catch (error: any) {
      const message =
        error?.message ?? 'No pudimos procesar el pago. Intentá nuevamente.';
      this._submitError.set(message);
      return { ok: false, error: message };
    } finally {
      this._isSubmitting.set(false);
    }
  };
}
