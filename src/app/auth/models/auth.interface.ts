export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

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

