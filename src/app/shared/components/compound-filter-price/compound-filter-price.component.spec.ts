import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompoundFilterPriceComponent } from './compound-filter-price.component';

describe('CompoundFilterPriceComponent', () => {
  let component: CompoundFilterPriceComponent;
  let fixture: ComponentFixture<CompoundFilterPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompoundFilterPriceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompoundFilterPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
