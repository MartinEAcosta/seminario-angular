
export interface User {
    username: string;
    email:    string;
    password: string;
    _id:      string;
}

export interface UserDTO {
    username?: string;
    email?: string;
    password: string;
}

export interface AuthResponse {
    ok:      boolean;
    userRef: User;
    token:   string;
}
