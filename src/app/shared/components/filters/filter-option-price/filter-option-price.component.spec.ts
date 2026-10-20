import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterOptionPriceComponent } from './filter-option-price.component';

describe('FilterOptionPriceComponent', () => {
  let component: FilterOptionPriceComponent;
  let fixture: ComponentFixture<FilterOptionPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterOptionPriceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterOptionPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
