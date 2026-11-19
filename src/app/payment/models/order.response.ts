// Forma cruda que llega del backend para order. Nada de este archivo se usa en
// un componente: todo pasa antes por `OrderMapper`.
//
// Las fechas se tipan `string`: `JSON.parse` no construye `Date`.

// Respuesta de POST /orders/ : el backend devuelve el payment persistido en Mongo
// (su propio DTO de payment, que este repo no modela), no la orden de MercadoPago.
// `status` es el status del gateway tal cual ('processed' | 'action_required' | ...)
// y `id_payment` es el id de la orden en MP.
export interface OrderResponseDto {
  id         : string;
  id_user    : string;
  id_courses : string[];
  id_payment : string | null;
  amount     : number;
  date       : string;
  method     : string | null;
  status     : string;
}
