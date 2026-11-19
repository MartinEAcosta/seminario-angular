import { ApiResponse } from '@shared/models/api.interfaces';
import { IdentificationType } from '@payment/models/payment.interface';
import { IdentificationTypeResponseDto } from '@payment/models/payment.response';

export class PaymentMapper {

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
