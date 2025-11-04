import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRegisterComponent } from '@auth/components/';


describe('FormRegisterComponent', () => {
  let component: FormRegisterComponent;
  let fixture: ComponentFixture<FormRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [FormRegisterComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(FormRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
