import { FormGroup } from "@angular/forms";
import type { User } from '@auth/models/auth.interface';
import type { AuthResponseDto } from '@auth/models/auth.response';
import type { UserDTO, PasswordDTO } from '@auth/models/auth.request';

export class AuthMapper {

    // Las tres últimas líneas son el trabajo real de este mapper: el backend manda
    // `role` como `string` y `avatar_url`/`id_file` nulos cuando el usuario no tiene
    // File, y el modelo interno no admite ninguna de las dos cosas.
    static mapResponseToUser( response : AuthResponseDto ) : User {
        return {
            id              : response.user.id,
            first_name      : response.user.first_name,
            last_name       : response.user.last_name,
            email           : response.user.email,
            isEmailVerified : response.user.isEmailVerified,
            role            : response.user.role as User['role'],
            avatar_url      : response.user.avatar_url ?? '',
            id_file         : response.user.id_file ?? '',
        };
    }

    static mapFormToUserDTO( form : FormGroup ) : UserDTO {
        const formValue = form.value;
        return {
            first_name : formValue.first_name,
            last_name : formValue.last_name,
            email    : formValue.email,
            password : formValue.password,
        }
    }

    static mapFormToPasswordDTO( form : FormGroup ) : PasswordDTO {
        const formValue = form.value;
        return {
            currentPassword : formValue.currentPassword,
            newPassword     : formValue.newPassword,
        }
    }
    
}