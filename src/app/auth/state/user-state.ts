import { Injectable, signal } from '@angular/core';
import { User } from '@interfaces/auth.interfaces';
import { Course } from '@interfaces/course.interfaces';
import { Enrollment } from 'enrollment/models/enrollment.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserState {

  public user = signal<User | null>(null);
  public courseSelected = signal<Course | null>(null);
  public enrollments = signal<Enrollment[] | null>(null); 

  constructor() { }

  public setCourse ( course : Course | null ) : void {
    this.courseSelected.set(course);
  }

  public setEnrollments ( enrolllments : Enrollment[] ) : void {
    this.enrollments.set( enrolllments );
  }

}
