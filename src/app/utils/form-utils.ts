import { FormGroup, ValidationErrors } from '@angular/forms';

export class FormUtils {

    static getTextError = ( errors : ValidationErrors ) : string | null =>  {

        for( const key of Object.keys(errors) ){
            switch( key ){
                case 'required':
                    return 'Este campo es requerido.';

                case 'minlength':
                    return `Debe contener como minimo ${ errors['minlength'].requiredLength } caracteres.`;

                case 'min':
                    return `El valor minimo es de ${ errors['min'].min }.`;
                case 'email':
                    return `El contenido del campo no luce como un email.`;
            }
        }

        return null;
    }

    static getFieldError= ( form : FormGroup ,  fieldName : string ) : string | null =>{
        if ( !form.controls[fieldName]) return null;

        const errors = form.controls[fieldName].errors ?? {};

        return FormUtils.getTextError(errors);

    }
      
    static isValidField = ( form : FormGroup , fieldName : string ) : boolean | null => {
        console.log(form.controls[fieldName].touched);
        return  ( !!form.controls[fieldName].errors && form.controls[fieldName].touched );
    }

}