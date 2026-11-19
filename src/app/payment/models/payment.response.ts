// Formas crudas que llegan del backend para payment. Nada de este archivo se usa
// en un componente: todo pasa antes por `PaymentMapper`.

export interface IssuerResponseDto {
  id               : string;
  name             : string;
  payment_type_id  : string;
  thumbnail        : string;
  secure_thumbnail : string;
}

export interface IdentificationTypeResponseDto {
  id   : string;
  name : string;
  type : string;
  // TODO: MercadoPago documenta estos dos como número. Verificar contra una
  // respuesta real antes de cambiar el tipo: el mapper los pasa tal cual.
  min_length : string;
  max_length : string;
}
