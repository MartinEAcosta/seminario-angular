
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