import { TestBed } from '@angular/core/testing';

import { CourseFormStateService } from './course-form-state';

describe('CourseFormStateService', () => {
  let service: CourseFormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseFormStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
