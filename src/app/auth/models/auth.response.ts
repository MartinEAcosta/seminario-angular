// Formas crudas que llegan del backend para auth. Nada de este archivo se usa en
// un componente: todo pasa antes por `AuthMapper`.

export interface UserResponseDto {
  id              : string;
  first_name      : string;
  last_name       : string;
  email           : string;
  isEmailVerified : boolean;
  role            : string;
  avatar_url      : string | null;
  id_file         : string | null;
}

export interface AuthResponseDto {
  ok    : boolean;
  user  : UserResponseDto;
  token : string;
}
