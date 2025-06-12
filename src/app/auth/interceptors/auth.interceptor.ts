import { inject } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { HttpHandlerFn, HttpRequest } from "@angular/common/http";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    
    
    // Inject the current `AuthService` and use it to get an authentication token:
    const token = inject(AuthService).token();
    // console.log({token});
    
    if( token ){
        // Clone the request to add the authentication header.
        const newReq = req.clone({
            headers: req.headers.append('x-token', token ),
        });
        // console.log("Funciono por lo menos", newReq);
        return next(newReq);
    }

    return next(req);

}