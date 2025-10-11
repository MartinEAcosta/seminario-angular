import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulesAccordionComponent } from './modules-accordion.component';

describe('ModulesAccordionComponent', () => {
  let component: ModulesAccordionComponent;
  let fixture: ComponentFixture<ModulesAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulesAccordionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModulesAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
