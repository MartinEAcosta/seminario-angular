import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { HttpHandlerFn, HttpRequest } from "@angular/common/http";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    
    
    // toma la referencia del authService en caso de que haya, sino la crea y toma el token
    const token = inject(AuthService).token();
    // console.log({token});
    
    if( token ){
        // Se clona debido a que las peticicones como si son inmutables, por lo tanto
        // tal como lo indica la docu se debe de clonar.
        const newReq = req.clone({
            headers: req.headers.append('Authorization', `Bearer ${token}`),
        });
        // console.log("Funciono por lo menos", newReq);
        return next(newReq);
    }

    return next(req);

}