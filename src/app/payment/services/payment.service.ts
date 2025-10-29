import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaymentMapper } from '@mappers/payment.mapper';
import { catchError, map, Observable } from 'rxjs';
import { IdentificationTypeListResponse, IssuerListResponse, TotalResponse } from 'src/app/shared/models/api.interface';
import { environment } from 'src/environments/environment';
import { IdentificationType, Issuer, PaymentDTO } from '../models/payment.interface';
import { CartItem } from 'src/app/cart/models/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}payments`;

  constructor() { }

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

  public createPayment = ( paymentRequest : any ) : Observable<any> => {
    return this.http
                .post<any>(`${this.baseURL}/`, {...paymentRequest})
                .pipe(
                  map( ( paymentResponse ) => {
                    console.log(paymentResponse)
                    return paymentResponse ;
                  }),
                  catchError((error) => { throw error;})
                )
  }

  public calculateTotal = ( items : CartItem[] , code ?: string ) : Observable<number> => {
    
    return this.http
                .post<TotalResponse>(`${this.baseURL}/total` , { items , code } )
                .pipe(
                  map( ( paymentResponse ) => {
                    return paymentResponse.data;
                  }),
                  catchError((error) => { throw error;})
                )
  }
}
