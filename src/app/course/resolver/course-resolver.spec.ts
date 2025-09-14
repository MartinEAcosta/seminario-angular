import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { courseResolverResolver } from './course-resolver';

describe('courseResolverResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => courseResolverResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
