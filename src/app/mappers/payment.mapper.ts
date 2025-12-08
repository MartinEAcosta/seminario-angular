import { TotalResponse } from '../shared/models/api.interfaces';
import { Issuer , IdentificationType } from "../payment/models/payment.interface";
import { IdentificationTypeListResponse, IndentificationTypeUniqueResponse, IssuerListResponse, IssuerUniqueResponse } from "../shared/models/api.interfaces";

export class PaymentMapper {

    static mapIssuerListResponseToEntityArray = ( response : IssuerListResponse ) : Issuer[] => {
        return response.data.map(PaymentMapper.mapIssuerResponseToEntity);
    };

    static mapIssuerResponseToEntity = ( response : IssuerUniqueResponse ) : Issuer => {
        return {
            id : response.id,
            name: response.name,
            payment_type_id: response.payment_type_id,
            thumbnail: response.thumbnail,
            secure_thumbnail: response.thumbnail,
        };
    };

    static mapIdentificationTypeResponseToEntity = ( response : IndentificationTypeUniqueResponse ) : IdentificationType => {
        return {
            id : response.id,
            name : response.name,
            type : response.type,
            min_length : response.min_length,
            max_length : response.max_length,
        };
    };

    static mapIdentificationTypeListResponseToEntityArray = ( response : IdentificationTypeListResponse ) : IdentificationType[] => {
        return response.data.map( PaymentMapper.mapIdentificationTypeResponseToEntity );
    };

    static mapTotalResponseToNumber = ( response : TotalResponse ) : number => {
        return response.data!;
    }
}