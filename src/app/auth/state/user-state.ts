import { Injectable, signal } from '@angular/core';
import { User } from '@interfaces/auth.interfaces';
import { Course } from '@interfaces/course.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserState {

  public user = signal<User | null>(null);
  public courseSelected = signal<Course | null>(null);

  constructor() { }

  public setCourse ( course : Course | null ) : void {
    this.courseSelected.set(course);
  }

}
