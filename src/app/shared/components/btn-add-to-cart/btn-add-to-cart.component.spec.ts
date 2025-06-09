import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnAddToCartComponent } from './btn-add-to-cart.component';

describe('BtnAddToCartComponent', () => {
  let component: BtnAddToCartComponent;
  let fixture: ComponentFixture<BtnAddToCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BtnAddToCartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnAddToCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
