import { ItemQuantity } from "@cart/models/cart.interface";

export interface Issuer {
    id : string,
    name : string,
    payment_type_id : string,
    thumbnail : string,
    secure_thumbnail : string,
}

export interface IdentificationType {
    id : string,
    name : string,
    type : string,
    min_length : string,
    max_length : string,
}

export interface OrderPayerDTO {
    email : string,
    first_name ?: string,
    last_name ?: string,
    identification ?: { type : string, number : string },
}

// Body de POST /orders/ : el backend lo valida con OrderRequestAdapterDto.create(),
// que acepta este formato plano y arma la orden de MercadoPago del lado del servidor
// ( incluido el total, que se recalcula desde los precios de la base ).
export interface CreateOrderRequestDTO {
    items : ItemQuantity[],
    token : string,
    payment_method_id : string,
    payment_method_type : string, // 'credit_card' | 'debit_card' | 'ticket'
    installments : number,
    payer : OrderPayerDTO,
    description ?: string,
}
