import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterOptionHoverComponent } from './filter-option-hover.component';

describe('FilterOptionHoverComponent', () => {
  let component: FilterOptionHoverComponent;
  let fixture: ComponentFixture<FilterOptionHoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterOptionHoverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterOptionHoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
