import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfLessonsComponent } from './list-of-lessons.component';

describe('ListOfLessonsComponent', () => {
  let component: ListOfLessonsComponent;
  let fixture: ComponentFixture<ListOfLessonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfLessonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfLessonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
