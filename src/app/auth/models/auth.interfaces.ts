export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

export interface AuthResponse {
    ok:      boolean;
    user:    User;
    token:   string;
}

export interface User {
    id              : string;
    first_name      : string;
    last_name       : string;
    email           : string;
    isEmailVerified : boolean;
    role            : 'student' | 'teacher' | 'admin';
    avatar_url      : string;
    id_file         : string;
}

export interface UserDTO {
    first_name      : string;
    last_name       : string;
    email          ?: string;
    password       ?: string | null;
    id_file        ?: string;
}

export interface PasswordDTO {
    currentPassword : string;
    newPassword : string;
}

