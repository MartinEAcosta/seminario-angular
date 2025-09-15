import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCoursePageComponent } from './update-course-page';

describe('UpdateCoursePageComponent', () => {
  let component: UpdateCoursePageComponent;
  let fixture: ComponentFixture<UpdateCoursePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCoursePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCoursePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
