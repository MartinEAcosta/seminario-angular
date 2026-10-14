import { InjectionToken , Signal } from "@angular/core";

export interface AuthProvider {
    ready: Signal<boolean>;
    prepare() : Promise<void>;
    signIn() : void;
    onCode( handler : (code: string) => void , onError?: (error: unknown) => void) : void;
}

export const AUTH_PROVIDER = new InjectionToken<AuthProvider>('AUTH_PROVIDER');