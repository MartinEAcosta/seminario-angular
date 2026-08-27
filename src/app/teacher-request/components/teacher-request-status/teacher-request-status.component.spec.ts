import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherRequestStatusComponent } from './teacher-request-status.component';

describe('TeacherRequestStatusComponent', () => {
  let component: TeacherRequestStatusComponent;
  let fixture: ComponentFixture<TeacherRequestStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherRequestStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherRequestStatusComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('request', {
      id: '1',
      status: 'pending',
      categoryIds: [],
      experience: '',
      motivation: '',
      courseIdea: '',
      portfolioUrl: null,
      rejectionReason: null,
      createdAt: new Date(),
      reviewedAt: null,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
