import type { User , AuthResponse } from "@interfaces/auth.interfaces";

export class AuthMapper {

    static mapResponseToUser( response : AuthResponse ) : User {
        return {
            id:      response.user.id,
            username: response.user.username,
            email:    response.user.email,
        };
    }

}