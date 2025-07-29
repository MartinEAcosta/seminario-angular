
export interface User {
    id:      string;
    username: string;
    email:    string;
}

export interface UserDTO {
    username?: string;
    email?: string;
    password: string;
}


export interface AuthResponse {
    ok:      boolean;
    user: User;
    token:   string;
}
