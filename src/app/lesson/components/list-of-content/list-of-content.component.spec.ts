import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfContentComponent } from './list-of-content.component';

describe('ListOfLessonsComponent', () => {
  let component: ListOfContentComponent;
  let fixture: ComponentFixture<ListOfContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
