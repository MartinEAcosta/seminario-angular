
export interface User {
    username: string;
    email:    string;
    password: string;
    _id:      string;
}

export interface RegisterUserDTO {
    username: string;
    email: string;
    password: string;
}

export interface LoginUserDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    ok:      boolean;
    userRef: User;
    token:   string;
}
