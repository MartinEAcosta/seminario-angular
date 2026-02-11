import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterOptionDefaultComponent } from './filter-option-default.component';


describe('FilterOptionComponent', () => {
  let component: FilterOptionDefaultComponent;
  let fixture: ComponentFixture<FilterOptionDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterOptionDefaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterOptionDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
