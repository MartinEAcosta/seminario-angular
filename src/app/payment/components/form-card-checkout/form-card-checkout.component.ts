import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from 'src/environments/environment';

declare global{
  interface Window {
    MercadoPago : any,
  }
}

@Component({
  selector: 'app-form-card-checkout',
  imports: [],
  templateUrl: './form-card-checkout.component.html',
  styleUrl: './form-card-checkout.component.scss'
})

export class FormCardCheckoutComponent {
  
  public router = inject(Router);
  public mp !: any;

  constructor( ) { }

  async ngOnInit(){
    await this.initializeMercadoPago();
  }

  private initializeMercadoPago = async( ) => {
    try{
      await loadMercadoPago();
      this.mp = new window.MercadoPago( `${environment.MERCADOPAGO_PUBLIC_KEY}` ,{
        locale: 'es-AR',
      } );
      this.initializeForm()
    }
    catch(error){
      console.log(error);
      throw error;
    }
  }

  private initializeForm = async( ) => {
    const cardNumberElem = this.mp.fields.create('cardNumber', {
      placeholder: "Número de la tarjeta"
    }).mount('form-checkout__cardNumber');
    const expirationDateElem = this.mp.fields.create('expirationDate', {
      placeholder: "MM/YY",
    }).mount('form-checkout__expirationDate');
    const securityCodeElem = this.mp.fields.create('securityCode', {
      placeholder: "Código de seguridad"
    }).mount('form-checkout__securityCode');
  }

}

