import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountCodeInputComponent } from './discount-code-input.component';

describe('DiscountCodeInputComponent', () => {
  let component: DiscountCodeInputComponent;
  let fixture: ComponentFixture<DiscountCodeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountCodeInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountCodeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
