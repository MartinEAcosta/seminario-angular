import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CheckoutFormState } from './checkout-form-state';
import { PaymentService } from '../services/payment.service';

describe('CheckoutFormState', () => {
  let service: CheckoutFormState;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;

  beforeEach(() => {
    paymentServiceSpy = jasmine.createSpyObj('PaymentService', [
      'createOrder',
      'getAllIdentificationTypes',
      'calculateTotal',
    ]);
    paymentServiceSpy.getAllIdentificationTypes.and.returnValue(of([]));
    paymentServiceSpy.calculateTotal.and.returnValue(of(0));

    TestBed.configureTestingModule({
      providers: [{ provide: PaymentService, useValue: paymentServiceSpy }],
    });
    service = TestBed.inject(CheckoutFormState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('submit() sin método de pago/cuotas resueltos no llama a createOrder', async () => {
    const result = await service.submit({
      firstName: 'Test',
      lastName: 'Testeable',
      identificationType: 'DNI',
      identificationNumber: '12345678',
      email: 'test@test.com',
    });

    expect(result.ok).toBeFalse();
    expect(paymentServiceSpy.createOrder).not.toHaveBeenCalled();
  });

  it('setAmount() ignora montos inválidos y acepta los válidos', () => {
    service.setAmount(1500);
    expect(service.amount()).toBe(1500);

    service.setAmount(-1);
    service.setAmount(Number.NaN);
    expect(service.amount()).toBe(1500);
  });

  it('selectInstallments() ignora cuotas que el gateway no ofreció', () => {
    service.selectInstallments(6);
    expect(service.selectedInstallments()).toBeNull();
  });

  it('reset() vuelve el estado a cero', () => {
    service.setAmount(999);
    service.reset();

    expect(service.amount()).toBe(0);
    expect(service.submitError()).toBeNull();
    expect(service.isSubmitting()).toBeFalse();
    expect(service.installmentOptions()).toEqual([]);
    expect(service.selectedInstallments()).toBeNull();
  });
});
