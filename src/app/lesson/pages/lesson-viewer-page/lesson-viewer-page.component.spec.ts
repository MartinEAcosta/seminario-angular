import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonViewerPageComponent } from './lesson-viewer-page.component';

describe('LessonViewerPageComponent', () => {
  let component: LessonViewerPageComponent;
  let fixture: ComponentFixture<LessonViewerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonViewerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonViewerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
