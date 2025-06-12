import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnBuyComponent } from './btn-primary.component';

describe('BtnBuyComponent', () => {
  let component: BtnBuyComponent;
  let fixture: ComponentFixture<BtnBuyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BtnBuyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
