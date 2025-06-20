import { FormGroup } from '@angular/forms';


export class FormUtils {

    static getFieldError( form : FormGroup ,  fieldName : string ) : string | null {
        if ( !form.controls[fieldName] ) return null;

        const errors = form.controls[fieldName].errors ?? {};

        for( const key of Object.keys(errors) ){
            switch( key ){
                case 'required':
                    return 'Este campo es requerido.';

                case 'minlength':
                    return `Debe contener como minimo ${ errors['minlength'].requiredLength } caracteres.`;

                case 'min':
                    return `El valor minimo es de ${ errors['min'].min }.`

            }
        }

        return null;
    }
      
    static isValidField( form : FormGroup , fieldName : string ) : boolean | null {
        return  ( !!form.controls[fieldName].errors && form.controls[fieldName].touched );
    }

}