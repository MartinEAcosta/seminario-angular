// Tipos de conveniencia para la SDK @mercadopago/sdk-js: el paquete solo tipa
// loadMercadoPago(); todo lo que cuelga de `window.MercadoPago` (mp.fields, mp.getIssuers, etc.)
// no tiene tipos oficiales. Solo se tipan los campos que este proyecto consume.

export interface MPFieldInstance {
  mount(containerId: string): MPFieldInstance;
  unmount(): void;
  update(properties: Record<string, unknown>): Promise<void>;
  on(eventName: string, callback: (data: any) => void): void;
}

export interface MPCardTokenResponse {
  id: string;
  status: string;
  first_six_digits: string;
  last_four_digits: string;
}

export interface MPPaymentMethodResult {
  id: string;
  payment_type_id: string;
  name: string;
  issuer: { default: boolean; name: string; id: string };
}

export interface MPPayerCost {
  installments: number;
  installment_rate: number;
  installment_amount: number;
  total_amount: number;
  recommended_message: string;
}

export interface MPFieldsApi {
  create(fieldType: string, properties?: Record<string, unknown>): MPFieldInstance;
  createCardToken(data: {
    cardholderName: string;
    identificationType: string;
    identificationNumber: string;
  }): Promise<MPCardTokenResponse>;
}

export interface MPInstallmentsResult {
  payment_method_id: string;
  payer_costs: MPPayerCost[];
}

// Superficie de window.MercadoPago que consume este flujo. Se tipa acá para no volver
// a un `any` en CheckoutFormState; agregar métodos nuevos a medida que se usen.
export interface MPInstance {
  fields: MPFieldsApi;
  getPaymentMethods(filters: { bin: string }): Promise<{ results: MPPaymentMethodResult[] }>;
  getInstallments(params: { amount: string; bin: string }): Promise<MPInstallmentsResult[]>;
}
