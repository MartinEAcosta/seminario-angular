import { inject } from "@angular/core";
import { UserState } from "@user/state/user-state";
import { HttpHandlerFn, HttpRequest } from "@angular/common/http";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {


    // toma la referencia del userState en caso de que haya, sino la crea y toma el token
    const token = inject(UserState).token();
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