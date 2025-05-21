import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UdemixAboutComponent } from './udemix-about.component';

describe('UdemixAboutComponent', () => {
  let component: UdemixAboutComponent;
  let fixture: ComponentFixture<UdemixAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UdemixAboutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UdemixAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
