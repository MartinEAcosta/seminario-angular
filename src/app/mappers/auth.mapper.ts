import type { User , AuthResponse } from "src/app/auth/models/auth.interfaces";

export class AuthMapper {

    static mapResponseToUser( response : AuthResponse ) : User {
        return {
            id              : response.user.id,
            username        : response.user.username,
            email           : response.user.email,
            isEmailVerified : response.user.isEmailVerified,
            role            : response.user.role,
        };
    }

}