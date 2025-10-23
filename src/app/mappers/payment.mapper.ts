import { Issuer } from "../payment/models/issuer.interface";
import { IssuerListResponse, IssuerUniqueResponse } from "../shared/models/api.interface";

export class PaymentMapper {

    static mapIssuerArrayResponseToEntityArray = ( response : IssuerListResponse ) : Issuer[] => {
        return response.data.map(PaymentMapper.mapIssuerResponseToEntity);
    }

    static mapIssuerResponseToEntity = ( response : IssuerUniqueResponse ) : Issuer => {
        return {
            id : response.id,
            name: response.name,
            payment_type_id: response.payment_type_id,
            thumbnail: response.thumbnail
        }
    }

}