import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaymentMapper } from '@mappers/payment.mapper';
import { OrderMapper } from '@mappers/order.mapper';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { IdentificationTypeListResponse, IssuerListResponse, OrderResponse, TotalResponse } from '@shared/models/api.interfaces';
import { IdentificationType, Issuer, CreateOrderRequestDTO } from '../models/payment.interface';
import { Order } from '../models/order.interface';
import { ItemQuantity } from '@cart/models/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}payments`;
  private ordersURL : string = `${environment.apiURL}orders`;

  constructor() { }

  // No se usa en el flujo de Fields: los payment methods se resuelven client-side vía mp.getPaymentMethods({bin}).
  public getAllPaymentMethods = ( ) : Observable<Issuer[]>=> {
    return this.http
                .get<IssuerListResponse>(`${this.baseURL}/methods`)
                .pipe(
                  map( ( paymentResponse ) => {
                    return PaymentMapper.mapIssuerListResponseToEntityArray(paymentResponse);
                  }),
                  catchError((error) => { throw error; })
                )
  }
  
  public getAllIdentificationTypes = ( ) : Observable<IdentificationType[]> => {
    return this.http
                .get<IdentificationTypeListResponse>(`${this.baseURL}/identification-types`)
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
                .post<OrderResponse>(`${this.ordersURL}/`, payload)
                .pipe(
                  map( ( orderResponse ) => {
                    return OrderMapper.mapCreateOrderResponseToEntity( orderResponse );
                  }),
                  catchError((error) => { throw error; })
                )
  }

  public calculateTotal = ( items : ItemQuantity[] ) : Observable<number> => {
    return this.http
                .post<TotalResponse>(`${this.baseURL}/total` , { items } )
                .pipe(
                  map( ( paymentResponse ) => {
                    return paymentResponse.data;
                  }),
                  catchError((error) => { throw error;})
                )
  }
}
