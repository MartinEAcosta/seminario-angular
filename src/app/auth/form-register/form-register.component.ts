import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-register',
  standalone: false,
  templateUrl: './form-register.component.html',
  styleUrls: [ '../form-global.scss' , './form-register.component.scss' ]
})
export class FormRegisterComponent {

  registerForm = new FormGroup({
    username : new FormControl(''),
    email : new FormControl(''),
    password : new FormControl(''),
  })

  onSumbit = () : void => {
    console.log(this.registerForm.value);
    try{

    }catch(error){
      console.log(error);
    }
  }
}
