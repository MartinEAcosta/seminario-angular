import { Routes } from "@angular/router";
import { BuyPage } from "./pages/buy/buy-page";
import { AuthenticatedGuard } from "@guards/authenticated.guard";

export const paymentRoutes : Routes = [
    {
        path: '',
        children: [
            {
                path : 'buy',
                component : BuyPage,
                canMatch: [ AuthenticatedGuard ],
            }
        ]
    }
];

export default paymentRoutes;