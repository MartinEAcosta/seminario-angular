import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDefaultComponent } from './filter-default.component';

describe('FilterDefaultComponent', () => {
  let component: FilterDefaultComponent;
  let fixture: ComponentFixture<FilterDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterDefaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
