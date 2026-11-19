// Formas que esta app le manda al backend para auth. Un tipo de este archivo se
// importa sólo para anotar un borde — la firma de un servicio, el parámetro de un
// handler. Construir el body es del mapper (`AuthMapper.mapFormToUserDTO` y
// `AuthMapper.mapFormToPasswordDTO`), nunca del componente.

export interface UserDTO {
    first_name     ?: string;
    last_name      ?: string;
    email           : string;
    password       ?: string | null;
    id_file        ?: string;
}

export interface PasswordDTO {
    currentPassword : string;
    newPassword : string;
}
