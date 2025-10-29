import { CartItem, ItemQuantity } from "src/app/cart/models/cart.interface"

export interface Issuer {
    id: string,
    name: string,
    payment_type_id: string    
    thumbnail: string,
    secure_thumbnail : string,
}

export interface IdentificationType {
    id : string,
    name : string,
    type : string,
    min_length : string,
    max_length : string,
}

export interface PaymentDTO {
    items : ItemQuantity[],
    payment_method_id : number,
    issuer_id : string,
    email : string,
    token : string,
    installments : number,
    identificationNumber : number,
    identificationType : string,
    code ?: string,
}