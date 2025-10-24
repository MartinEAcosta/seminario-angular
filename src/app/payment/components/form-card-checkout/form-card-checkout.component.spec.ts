import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCardCheckoutComponent } from './form-card-checkout.component';

describe('FormCardCheckoutComponent', () => {
  let component: FormCardCheckoutComponent;
  let fixture: ComponentFixture<FormCardCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCardCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCardCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
