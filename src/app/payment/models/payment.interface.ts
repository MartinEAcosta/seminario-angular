// Datos del titular que junta el formulario de checkout. Vive acá y no dentro del
// state porque lo consumen los dos lados: el state lo recibe del componente y
// `OrderMapper` lo convierte en el `payer` del body de `POST /orders/`.
export interface CardholderFormValue {
  firstName: string;
  lastName: string;
  identificationType: string;
  identificationNumber: string;
  email: string;
}

export interface IdentificationType {
    id : string,
    name : string,
    type : string,
    min_length : string,
    max_length : string,
}
