import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnAddToCartComponent } from './btn-border-thin.component';

describe('BtnAddToCartComponent', () => {
  let component: BtnAddToCartComponent;
  let fixture: ComponentFixture<BtnAddToCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [BtnAddToCartComponent]
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
