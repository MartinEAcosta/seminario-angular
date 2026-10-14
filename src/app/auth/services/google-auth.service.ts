import { inject, Injectable, NgZone, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AuthProvider } from '@auth/auth.provider';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService implements AuthProvider {

  private zone = inject(NgZone);
  private readyPromise?: Promise<void>;
  private googleAuthClient?: any;
  readonly ready = signal<boolean>(false);
  private codeHandler?: (code: string) => void;
  private errorHandler?: (error: unknown) => void;

  async prepare() : Promise<void>{
    this.readyPromise ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.googleAuthClient = google.accounts.oauth2.initCodeClient({
          client_id: environment.GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: (response) => this.zone.run(() => this.codeHandler?.(response.code)),
          error_callback: (err) => this.zone.run(() => this.errorHandler?.(err.type)),   // p. ej. el usuario cerró el popup
        });
        this.ready.set(true);
        resolve();
      }
      script.onerror = () => {
        this.readyPromise = undefined;
        reject('El script de Google no cargó.')
      };
      document.head.appendChild(script);
    });
    return this.readyPromise;
  }

  onCode( handler: (code: string) => void, onError: (error: unknown) => void) {
    this.codeHandler = handler;
    this.errorHandler = onError;
  }

  signIn(): void {
    if (!this.googleAuthClient) throw new Error('Google todavía no está listo');
    this.googleAuthClient.requestCode();
  }
  
}
