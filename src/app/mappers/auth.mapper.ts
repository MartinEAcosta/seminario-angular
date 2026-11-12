import { FormGroup } from "@angular/forms";
import type { User , AuthResponse, UserDTO, PasswordDTO } from "@auth/models/auth.interfaces";

export class AuthMapper {

    static mapResponseToUser( response : AuthResponse ) : User {
        return {
            id              : response.user.id,
            first_name      : response.user.first_name,
            last_name       : response.user.last_name,
            email           : response.user.email,
            isEmailVerified : response.user.isEmailVerified,
            role            : response.user.role,
            avatar_url      : response.user.avatar_url,
            id_file         : response.user.id_file
        };
    }

    static mapFormToUserDTO( form : FormGroup ) : UserDTO {
        const formValue = form.value;
        return {
            first_name : formValue.first_name,
            last_name : formValue.last_name,
            email    : formValue.email,
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