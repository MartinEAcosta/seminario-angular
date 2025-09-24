import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderContenManagerComponent } from './slider-content-manager.component';

describe('SliderContenManagerComponent', () => {
  let component: SliderContenManagerComponent;
  let fixture: ComponentFixture<SliderContenManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderContenManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliderContenManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
