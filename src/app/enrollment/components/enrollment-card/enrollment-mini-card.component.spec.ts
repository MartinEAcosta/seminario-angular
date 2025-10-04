import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentCardComponent } from './enrollment-card.component';

describe('EnrollmentCardComponent', () => {
  let component: EnrollmentCardComponent;
  let fixture: ComponentFixture<EnrollmentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
