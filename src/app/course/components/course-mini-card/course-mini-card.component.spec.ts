import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMiniCardComponent } from './course-mini-card.component';

describe('CourseMiniCardComponent', () => {
  let component: CourseMiniCardComponent;
  let fixture: ComponentFixture<CourseMiniCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMiniCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMiniCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
