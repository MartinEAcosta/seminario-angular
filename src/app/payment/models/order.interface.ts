// Estado de la compra dentro de la app. Traduce el status del gateway (MercadoPago)
// a algo que la UI pueda ramificar sin conocer los nombres de MercadoPago.
export type OrderStatus = 'approved' | 'pending' | 'rejected' | 'unknown';

export interface Order {
    id         : string;
    gatewayId  : string | null;
    status     : OrderStatus;
    amount     : number;
    courseIds  : string[];
}

