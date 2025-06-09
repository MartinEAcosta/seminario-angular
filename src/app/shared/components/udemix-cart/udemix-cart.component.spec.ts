import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UdemixCartComponent } from './udemix-cart.component';

describe('UdemixCartComponent', () => {
  let component: UdemixCartComponent;
  let fixture: ComponentFixture<UdemixCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UdemixCartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UdemixCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
