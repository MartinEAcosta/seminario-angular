import { TestBed } from '@angular/core/testing';

import { LessonFormState } from '../lesson/lesson-form-state';

describe('LessonFormState', () => {
  let service: LessonFormState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonFormState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
