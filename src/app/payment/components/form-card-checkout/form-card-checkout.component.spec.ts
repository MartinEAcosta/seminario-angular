import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { FormCardCheckoutComponent } from './form-card-checkout.component';
import { CheckoutFormState } from '../../state/checkout-form-state';

describe('FormCardCheckoutComponent', () => {
  let component: FormCardCheckoutComponent;
  let fixture: ComponentFixture<FormCardCheckoutComponent>;

  const amount = signal(0);
  const selectedInstallments = signal<number | null>(null);

  const checkoutFormStateMock = {
    amount: amount.asReadonly(),
    installmentOptions: signal([]).asReadonly(),
    selectedInstallments: selectedInstallments.asReadonly(),
    isLoadingBinLookup: signal(false).asReadonly(),
    isSubmitting: signal(false).asReadonly(),
    submitError: signal(null).asReadonly(),
    identificationTypeResource: { hasValue: () => false, value: () => [] },
    setAmount: (value: number) => amount.set(value),
    selectInstallments: (installments: number) => selectedInstallments.set(installments),
    initialize: async () => {},
    mountFields: () => {},
    unmountFields: () => {},
    reset: () => {},
    submit: async () => ({ ok: false, error: 'mock' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCardCheckoutComponent],
      providers: [{ provide: CheckoutFormState, useValue: checkoutFormStateMock }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCardCheckoutComponent);
    fixture.componentRef.setInput('amount', 100);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('propaga el monto al estado a través de setAmount()', () => {
    expect(amount()).toBe(100);
  });
});
