import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaymentMapper } from '@mappers/payment.mapper';
import { OrderMapper } from '@mappers/order.mapper';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { ApiResponse } from '@shared/models/api.response';
import { IdentificationTypeResponseDto } from '@payment/models/payment.response';
import { OrderResponseDto } from '@payment/models/order.response';
import { IdentificationType, CreateOrderRequestDTO } from '../models/payment.model';
import { Order } from '@payment/models/order.model';
import { ItemQuantity } from '@cart/models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}payments`;
  private ordersURL : string = `${environment.apiURL}orders`;

  constructor() { }

  public getAllIdentificationTypes = ( ) : Observable<IdentificationType[]> => {
    return this.http
                .get<ApiResponse<IdentificationTypeResponseDto[]>>(`${this.baseURL}/identification-types`)
                .pipe(
                  map( ( paymentResponse ) => {
                    return PaymentMapper.mapIdentificationTypeListResponseToEntityArray( paymentResponse )
                  }),
                  catchError((error) => { throw error;})
                )
  }

  // Un solo paso: el backend crea el payment, dispara la orden en MercadoPago y, si el
  // gateway responde 'processed', genera las inscripciones antes de contestar.
  public createOrder = ( payload : CreateOrderRequestDTO ) : Observable<Order> => {
    return this.http
                .post<ApiResponse<OrderResponseDto>>(`${this.ordersURL}/`, payload)
                .pipe(
                  map( ( orderResponse ) => {
                    return OrderMapper.mapCreateOrderResponseToEntity( orderResponse );
                  }),
                  catchError((error) => { throw error; })
                )
  }

  public calculateTotal = ( items : ItemQuantity[] ) : Observable<number> => {
    return this.http
                .post<ApiResponse<number>>(`${this.baseURL}/total` , { items } )
                .pipe(
                  map( ( paymentResponse ) => {
                    return paymentResponse.data;
                  }),
                  catchError((error) => { throw error;})
                )
  }
}
