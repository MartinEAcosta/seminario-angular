import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCatalogCardComponent } from './course-catalog-card.component';

describe('CourseCatalogCardComponent', () => {
  let component: CourseCatalogCardComponent;
  let fixture: ComponentFixture<CourseCatalogCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCatalogCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseCatalogCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
