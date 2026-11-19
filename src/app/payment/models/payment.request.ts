// Formas que esta app le manda al backend para payment. Un tipo de este archivo se
// importa sólo para anotar un borde — la firma de un servicio, el parámetro de un
// handler. Construir el body es del mapper
// (`OrderMapper.mapCheckoutToCreateOrderRequest`), nunca del componente ni del state.
//
// `ItemQuantity` vive acá y no en `cart` porque es parte del body de `POST /orders/`:
// la feature dueña del endpoint es dueña del contrato. `cart.service.getItemsArray()`
// es el traductor que lo produce.

export interface ItemQuantity {
    id_course  : string;
    title      : string;
    unit_price : string;
    quantity   : number;
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
