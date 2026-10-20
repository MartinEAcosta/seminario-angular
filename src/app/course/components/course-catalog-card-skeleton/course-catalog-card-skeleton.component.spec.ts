import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCatalogCardSkeletonComponent } from './course-catalog-card-skeleton.component';

describe('CourseCatalogCardSkeletonComponent', () => {
  let component: CourseCatalogCardSkeletonComponent;
  let fixture: ComponentFixture<CourseCatalogCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCatalogCardSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseCatalogCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
