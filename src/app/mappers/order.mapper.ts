import { ApiResponse } from '@shared/models/api.interfaces';
import { Order, OrderStatus } from '@payment/models/order.interface';
import { OrderResponseDto } from '@payment/models/order.response';
import type { CardholderFormValue } from '@payment/models/payment.interface';
import type { CreateOrderRequestDTO, ItemQuantity } from '@payment/models/payment.request';
import type { MPPaymentMethodResult } from '@payment/models/mercadopago-fields.interface';

export class OrderMapper {

    // Este payload no se loguea nunca: lleva el token de la tarjeta, el mail y el documento.
    //
    // Recibe cinco argumentos y no un `FormGroup` como los otros métodos salientes del repo
    // porque compone tres fuentes — los items del carrito, el token que devuelve
    // `createCardToken` y el form del titular — y no existe ningún formulario que tenga las
    // tres. El precio de la firma explícita se paga una vez; a cambio, el payload con el
    // token de la tarjeta queda escrito en un solo lugar.
    static mapCheckoutToCreateOrderRequest = (
        items : ItemQuantity[],
        token : string,
        paymentMethod : MPPaymentMethodResult,
        installments : number,
        cardholder : CardholderFormValue,
    ) : CreateOrderRequestDTO => {
        return {
            items,
            token,
            payment_method_id: paymentMethod.id,
            payment_method_type: paymentMethod.payment_type_id,
            installments,
            payer: {
                email: cardholder.email,
                first_name: cardholder.firstName,
                last_name: cardholder.lastName,
                identification: {
                    type: cardholder.identificationType,
                    number: cardholder.identificationNumber,
                },
            },
        };
    };

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
