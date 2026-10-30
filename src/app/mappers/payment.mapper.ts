import { Issuer , IdentificationType } from "@payment/models/payment.interface";
import { ApiResponse, IdentificationTypeResponseDto, IssuerResponseDto } from "@shared/models/api.interfaces";

export class PaymentMapper {

    static mapIssuerListResponseToEntityArray = ( response : ApiResponse<IssuerResponseDto[]> ) : Issuer[] => {
        return response.data.map(PaymentMapper.mapIssuerResponseToEntity);
    };

    static mapIssuerResponseToEntity = ( response : IssuerResponseDto ) : Issuer => {
        return {
            id : response.id,
            name: response.name,
            payment_type_id: response.payment_type_id,
            thumbnail: response.thumbnail,
            secure_thumbnail: response.thumbnail,
        };
    };

    static mapIdentificationTypeResponseToEntity = ( response : IdentificationTypeResponseDto ) : IdentificationType => {
        return {
            id : response.id,
            name : response.name,
            type : response.type,
            min_length : response.min_length,
            max_length : response.max_length,
        };
    };

    static mapIdentificationTypeListResponseToEntityArray = ( response : ApiResponse<IdentificationTypeResponseDto[]> ) : IdentificationType[] => {
        return response.data.map( PaymentMapper.mapIdentificationTypeResponseToEntity );
    };

    static mapTotalResponseToNumber = ( response : ApiResponse<number> ) : number => {
        return response.data!;
    }
}
