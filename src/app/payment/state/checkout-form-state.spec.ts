import { TestBed } from '@angular/core/testing';

import { CheckoutFormStateService } from './checkout-form-state';

describe('CheckoutFormStateService', () => {
  let service: CheckoutFormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutFormStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
