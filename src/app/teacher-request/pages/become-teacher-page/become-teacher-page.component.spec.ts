import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BecomeTeacherPageComponent } from './become-teacher-page.component';

describe('BecomeTeacherPageComponent', () => {
  let component: BecomeTeacherPageComponent;
  let fixture: ComponentFixture<BecomeTeacherPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BecomeTeacherPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BecomeTeacherPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
