import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLabelErrorComponent } from './form-label-error.component';

describe('FormLabelErrorComponent', () => {
  let component: FormLabelErrorComponent;
  let fixture: ComponentFixture<FormLabelErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormLabelErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormLabelErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
