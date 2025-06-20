import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormErrorLabelComponent } from './form-error-label.component';

describe('FormErrorLabelComponent', () => {
  let component: FormErrorLabelComponent;
  let fixture: ComponentFixture<FormErrorLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorLabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormErrorLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
