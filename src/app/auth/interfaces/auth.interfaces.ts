// export interface AuthResponse {
//     ok:           boolean;
//     errorMessage: string;
// }


export interface User {
    username: string;
    email:    string;
    password: string;
    _id:      string;
    __v:      number;
}

export interface AuthResponse {
    ok:      boolean;
    userRef: User;
    token:   string;
}
