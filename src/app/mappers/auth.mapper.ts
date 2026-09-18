import { FormGroup } from "@angular/forms";
import type { User , AuthResponse } from "@auth/models/auth.interfaces";

export class AuthMapper {

    static mapResponseToUser( response : AuthResponse ) : User {
        return {
            id              : response.user.id,
            username        : response.user.username,
            email           : response.user.email,
            isEmailVerified : response.user.isEmailVerified,
            role            : response.user.role,
            avatar_url      : response.user.avatar_url,
            id_file         : response.user.id_file
        };
    }

    static mapFormToUserDTO( form : FormGroup ) : Partial<User> {
        const formValue = form.value;
        return {
            username : formValue.username,
            email    : formValue.email,
            avatar_url : formValue.avatar_url,
            id_file : formValue.id_file
        }
    }


}