import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaymentMapper } from '@mappers/payment.mapper';
import { catchError, map, Observable } from 'rxjs';
import { IssuerListResponse } from 'src/app/shared/models/api.interface';
import { environment } from 'src/environments/environment';
import { Issuer } from '../models/issuer.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);
  private baseURL : string = `${environment.apiURL}/payments`

  constructor() { }

  public getAllPaymentMethods = ( ) : Observable<Issuer[]>=> {
    return this.http
                .get<IssuerListResponse>(`${this.baseURL}`)
                .pipe(
                    map( ( paymentResponse ) => {
                      return PaymentMapper.mapIssuerArrayResponseToEntityArray(paymentResponse);
                    }),
                    catchError((error) => { throw error; })
    )
  }
}
