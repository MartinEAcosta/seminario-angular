import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartPanelItemComponent } from './cart-panel-item.component';

describe('CartPanelItemComponent', () => {
  let component: CartPanelItemComponent;
  let fixture: ComponentFixture<CartPanelItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPanelItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartPanelItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
