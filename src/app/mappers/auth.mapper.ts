import type { User , AuthResponse } from "@interfaces/auth.interfaces";

export class AuthMapper {

    static mapResponseToUser( response : AuthResponse ) : User {
        return {
            username: response.userRef.username,
            email:    response.userRef.email,
            password: response.userRef.password,
            _id:      response.userRef._id,
        };
    }

}