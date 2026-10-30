import { ApiResponse, OrderResponseDto } from '@shared/models/api.interfaces';
import { Order, OrderStatus } from '@payment/models/order.interface';

export class OrderMapper {

    // Los valores son los de la Orders API de MercadoPago, que el backend reenvía sin tocar
    // ( ver OrderMapper.fromMercadoPagoResponseToGatewayResult en el repo del back ).
    static mapGatewayStatusToOrderStatus = ( status : string | null | undefined ) : OrderStatus => {
        switch( status ){
            case 'processed'       : return 'approved';
            case 'created'         :
            case 'pending'         :
            case 'in_process'      :
            case 'at_terminal'     : return 'pending';
            case 'action_required' :
            case 'rejected'        :
            case 'failed'          :
            case 'canceled'        :
            case 'expired'         : return 'rejected';
            default                : return 'unknown';
        }
    };

    static mapOrderResponseToEntity = ( response : OrderResponseDto ) : Order => {
        return {
            id        : response.id,
            gatewayId : response.id_payment ?? null,
            status    : OrderMapper.mapGatewayStatusToOrderStatus( response.status ),
            amount    : response.amount,
            courseIds : response.id_courses ?? [],
        };
    };

    static mapCreateOrderResponseToEntity = ( response : ApiResponse<OrderResponseDto> ) : Order => {
        return OrderMapper.mapOrderResponseToEntity( response.data );
    };

}
