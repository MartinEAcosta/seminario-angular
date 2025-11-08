import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveModuleComponent } from './save-module.component';

describe('SaveModuleComponent', () => {
  let component: SaveModuleComponent;
  let fixture: ComponentFixture<SaveModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
