import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryCourseCardComponent } from './library-course-card.component';

describe('LibraryCourseCardComponent', () => {
  let component: LibraryCourseCardComponent;
  let fixture: ComponentFixture<LibraryCourseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryCourseCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibraryCourseCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
