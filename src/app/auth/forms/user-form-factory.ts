import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { User } from "@auth/models/auth.interfaces";
import { FormUtils } from "@utils/form-utils";

export const userFieldsValidators = {
    first_name : [ Validators.required, Validators.minLength(3), Validators.pattern(FormUtils.notOnlySpacesPattern) ],
    last_name  : [ Validators.required, Validators.minLength(2), Validators.pattern(FormUtils.notOnlySpacesPattern) ],
    email      : [ Validators.required, Validators.pattern(FormUtils.emailPattern) ],
    password   : [ Validators.required, Validators.pattern(FormUtils.strongPasswordPattern) ],
    avatar     : [ FormUtils.fileMaxSizeValidator(2_000_000) ],
}

export function buildProfileForm ( fb : FormBuilder ) : FormGroup {
    return fb.nonNullable.group({
        first_name : [ '', userFieldsValidators.first_name ],
        last_name  : [ '', userFieldsValidators.last_name ],
        email      : [ '', userFieldsValidators.email ],
        avatar     : [ null, userFieldsValidators.avatar ],
    });
}

export function patchProfileForm( form : ProfileForm, user : User ) : void {
  form.reset({
    first_name : user.first_name,
    last_name  : user.last_name,
    email      : user.email,
    avatar     : null,
  });
}

export type ProfileForm = ReturnType<typeof buildProfileForm>;

export function buildRegisterForm ( fb : FormBuilder ) : FormGroup {
    return fb.group({
        first_name : [ '' , userFieldsValidators.first_name ],
        last_name : [ '' , userFieldsValidators.last_name ], 
        email : [ '', userFieldsValidators.email],
        password : [ '' , userFieldsValidators.password ],
    });
}


export function buildLoginForm ( fb : FormBuilder ) : FormGroup {
    return fb.group({
        email : [ '', userFieldsValidators.email],
    });
}

export function buildPasswordForm ( fb : FormBuilder ) : FormGroup {
    return fb.group({
        currentPassword : [ '', [ Validators.required ] ],
        newPassword : [ '', [ Validators.required, Validators.pattern( FormUtils.strongPasswordPattern ) ] ],
        confirmPassword : [ '', [ Validators.required ] ],
    }, { validators : passwordsMatchValidator });
}

const passwordsMatchValidator = ( group : AbstractControl ) : ValidationErrors | null => {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  return newPassword === confirmPassword ? null : { passwordsMismatch : true };
}

const strongPasswordRegex = new RegExp( FormUtils.strongPasswordPattern );

export interface PasswordStrength {
    started: boolean;
    halfway: boolean;
    minLength: boolean;
    valid: boolean;
};

export function getPasswordStrength( value : string ) : PasswordStrength {
  return {
    started   : value.length > 0,
    halfway   : value.length >= 4,
    minLength : value.length >= 8,
    valid     : strongPasswordRegex.test( value ),
  };
}